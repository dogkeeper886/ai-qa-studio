/**
 * AI QA Studio hub.
 *
 * Two jobs, both proven in the POC (issues #9/#10):
 *  1. HTTP — serve the markdown source of truth (docs/stories/) to the GUI.
 *  2. WebSocket — bridge an ACP agent session. The browser is the ACP client;
 *     the hub spawns `claude-code-acp` and relays JSON-RPC stdio<->WS
 *     byte-for-byte (real mode), or impersonates a scripted agent (fake mode,
 *     so the frontend builds without spending agent credit).
 *
 * The fake/real choice is injected so the same server is used either way.
 */

import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { readFile, readdir, stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { WebSocketServer, type WebSocket } from "ws";

const here = dirname(fileURLToPath(import.meta.url));
/** code/hub/src -> repo root. The agent runs here so .claude/ skills load. */
export const repoRoot = resolve(here, "../../..");
/** The workbench: each subfolder is a repo the studio works on (STORY-004). */
const activeDir = resolve(repoRoot, "active");

// --- active/<repo>: the workbench of repos ----------------------------------

/** A repo name is a single path segment of safe chars (no slashes). This — plus
 *  storiesDirOf's explicit `.`/`..` rejection — is the path-scope guard: it keeps
 *  a resolved name from addressing anything but one entry directly under active/. */
const REPO_NAME_RE = /^[A-Za-z0-9._-]+$/;

export interface RepoListing {
  /** Folder name under active/ — the id used in /api/repos/:repo/… */
  name: string;
  /** Whether the repo has a docs/stories/ to show. */
  hasStories: boolean;
}

/** List the repos under active/ (directories only; skips .gitkeep and files). */
export async function listRepos(): Promise<RepoListing[]> {
  let entries: import("node:fs").Dirent[];
  try {
    entries = await readdir(activeDir, { withFileTypes: true });
  } catch {
    return [];
  }
  const dirs = entries.filter((e) => e.isDirectory() && REPO_NAME_RE.test(e.name));
  const out = await Promise.all(
    dirs.map(async (e): Promise<RepoListing> => {
      let hasStories = false;
      try {
        const st = await stat(resolve(activeDir, e.name, "docs/stories"));
        hasStories = st.isDirectory();
      } catch {
        /* no docs/stories — still a repo, just nothing to show yet */
      }
      return { name: e.name, hasStories };
    }),
  );
  out.sort((a, b) => a.name.localeCompare(b.name));
  return out;
}

/** Resolve a repo's docs/stories dir, or null if the name is unsafe or missing.
 *  The shape guard rejects slashes and the `.`/`..` traversal segments, so the
 *  name can only address one entry under active/; a single stat then confirms it
 *  exists — no need to list the whole workbench on every request. */
async function storiesDirOf(repo: string): Promise<string | null> {
  if (!REPO_NAME_RE.test(repo) || repo === "." || repo === "..") return null;
  const dir = resolve(activeDir, repo, "docs/stories");
  try {
    return (await stat(dir)).isDirectory() ? dir : null;
  } catch {
    return null; // repo or its docs/stories doesn't exist
  }
}

// --- docs/stories: the markdown source of truth (per repo) ------------------

const STORY_FILE_RE = /^(STORY-\d+)[^/]*\.md$/;

export interface StoryListing {
  /** STORY-NNN — the id used in /api/repos/:repo/stories/:id. */
  id: string;
  /** File name under the repo's docs/stories/. */
  file: string;
  /** First-heading title, minus the "STORY-NNN: " prefix. */
  title: string;
}

/** Title = first H1 minus the "STORY-NNN: " prefix; falls back to the id when
 *  the heading is missing or empty after stripping. */
function titleOf(markdown: string, id: string): string {
  const h1 = markdown.match(/^#\s+(.+?)\s*$/m)?.[1];
  return h1?.replace(/^STORY-\d+:\s*/, "").trim() || id;
}

/** List a repo's stories (STORY-NNN*.md), skipping README and the like. */
export async function listStories(storiesDir: string): Promise<StoryListing[]> {
  let files: string[];
  try {
    files = await readdir(storiesDir);
  } catch {
    return [];
  }
  const matched = files.filter((f) => STORY_FILE_RE.test(f));
  const out = await Promise.all(
    matched.map(async (file): Promise<StoryListing> => {
      const id = file.match(STORY_FILE_RE)![1];
      try {
        return { id, file, title: titleOf(await readFile(join(storiesDir, file), "utf8"), id) };
      } catch {
        return { id, file, title: id };
      }
    }),
  );
  out.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true })); // STORY-2 before STORY-10
  return out;
}

/** Read one story's raw markdown by id from a repo's stories dir. Reads only the
 *  target file (no listing pass). Returns null if unknown or the id escapes the
 *  shape guard. */
export async function readStory(storiesDir: string, id: string): Promise<string | null> {
  if (!/^STORY-\d+$/.test(id)) return null; // id-shape guard = path-scope safety
  let files: string[];
  try {
    files = await readdir(storiesDir);
  } catch {
    return null;
  }
  const file = files.find((f) => f.match(STORY_FILE_RE)?.[1] === id);
  if (!file) return null;
  try {
    return await readFile(join(storiesDir, file), "utf8");
  } catch {
    return null;
  }
}

// --- ACP agent over WebSocket ----------------------------------------------

const require = createRequire(import.meta.url);
const adapterEntry = resolve(
  dirname(require.resolve("@zed-industries/claude-code-acp/package.json")),
  "dist/index.js",
);

/** Real mode: spawn the adapter and relay stdio <-> WS byte-for-byte. The
 *  adapter wraps the `claude` CLI, which refuses to launch nested inside a
 *  Claude Code session, so clear the markers. Auth comes from ~/.claude. */
function attachRealAgent(ws: WebSocket): void {
  const env = { ...process.env };
  delete env.CLAUDECODE;
  delete env.CLAUDE_CODE_ENTRYPOINT;
  delete env.CLAUDE_CODE_SSE_PORT;
  const child = spawn(process.execPath, [adapterEntry], { cwd: repoRoot, stdio: ["pipe", "pipe", "pipe"], env });
  process.stderr.write(`[hub] agent connected — adapter pid=${child.pid}\n`);

  let buf = "";
  child.stdout.on("data", (chunk: Buffer) => {
    buf += chunk.toString("utf8");
    let nl: number;
    while ((nl = buf.indexOf("\n")) !== -1) {
      const line = buf.slice(0, nl);
      buf = buf.slice(nl + 1);
      if (line.trim() && ws.readyState === ws.OPEN) ws.send(line);
    }
  });
  child.stderr.on("data", (chunk: Buffer) => process.stderr.write(`[adapter] ${chunk}`));

  ws.on("message", (data) => {
    if (!child.stdin.writable) return;
    const text = typeof data === "string" ? data : data.toString("utf8");
    for (const frame of text.split("\n")) if (frame.trim()) child.stdin.write(frame + "\n");
  });

  const shutdown = (why: string) => {
    process.stderr.write(`[hub] closing (${why}) — killing adapter pid=${child.pid}\n`);
    child.kill("SIGTERM");
    // Escalate if the wrapped `claude` CLI ignores SIGTERM (it can orphan — seen
    // in the POC). `exit` clears the timer; unref so it never holds the process.
    const t = setTimeout(() => { if (child.exitCode === null) child.kill("SIGKILL"); }, 2000);
    t.unref();
    child.once("exit", () => clearTimeout(t));
    if (ws.readyState === ws.OPEN) ws.close();
  };
  ws.on("close", () => shutdown("ws closed"));
  ws.on("error", (e) => shutdown(`ws error: ${e.message}`));
  child.on("error", (e) => { process.stderr.write(`[hub] adapter spawn error: ${e.message}\n`); if (ws.readyState === ws.OPEN) ws.close(1011, "adapter spawn error"); });
  child.on("exit", (code, signal) => { process.stderr.write(`[hub] adapter exited code=${code} signal=${signal}\n`); if (ws.readyState === ws.OPEN) ws.close(1000, "agent exited"); });
}

/** Fake mode: a minimal scripted ACP agent so the frontend can build the thread
 *  without the real adapter (no credit, no auth, deterministic). Speaks the same
 *  JSON-RPC: initialize / session/new / session/prompt, streaming session/update
 *  notifications and one session/request_permission before ending the turn. */
function attachFakeAgent(ws: WebSocket): void {
  process.stderr.write("[hub] client connected — FAKE agent\n");
  const send = (o: unknown) => { if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(o)); };
  const note = (sessionId: string, update: unknown) => send({ jsonrpc: "2.0", method: "session/update", params: { sessionId, update } });
  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const sessionId = "fake-session";
  const PERMISSION_ID = "fake-perm-1"; // string id can't collide with the client's numeric request ids
  let promptId: string | number | null = null; // the open session/prompt awaiting our result

  ws.on("message", async (data) => {
    let msg: { id?: string | number; method?: string; result?: unknown; params?: { protocolVersion?: number } };
    try { msg = JSON.parse(typeof data === "string" ? data : data.toString("utf8")); } catch { return; }

    if (msg.method === "initialize") {
      send({ jsonrpc: "2.0", id: msg.id, result: {
        protocolVersion: msg.params?.protocolVersion ?? 1, // echo the client's version, like a real agent
        agentInfo: { name: "fake-agent", title: "Fake (dev)", version: "0.0.1" },
        agentCapabilities: { promptCapabilities: { image: false, embeddedContext: true }, loadSession: false },
      } });
    } else if (msg.method === "session/new") {
      send({ jsonrpc: "2.0", id: msg.id, result: { sessionId } });
      // the real adapter surfaces slash commands right after session setup — mirror it so
      // the frontend exercises that path in fake mode too.
      note(sessionId, { sessionUpdate: "available_commands_update", availableCommands: [
        { name: "jr-trace", description: "Trace a ticket into a workspace", input: null },
        { name: "tw-plan-init", description: "Start a test plan", input: null },
      ] });
    } else if (msg.method === "session/prompt") {
      promptId = msg.id ?? null;
      note(sessionId, { sessionUpdate: "agent_message_chunk", content: { type: "text", text: "Planning the tests for STORY-001…" } });
      await wait(250);
      note(sessionId, { sessionUpdate: "plan", entries: [
        { content: "Read the story", status: "completed", priority: "high" },
        { content: "Draft the overview", status: "in_progress", priority: "high" },
        { content: "Write the sections", status: "pending", priority: "medium" },
      ] });
      await wait(250);
      note(sessionId, { sessionUpdate: "tool_call", toolCallId: "t1", title: "ls docs/stories", kind: "execute", status: "completed", content: [{ type: "content", content: { type: "text", text: "STORY-001.md  STORY-002.md  STORY-003.md" } }] });
      await wait(250);
      // pause for a permission decision — the frontend renders the question box
      send({ jsonrpc: "2.0", id: PERMISSION_ID, method: "session/request_permission", params: { sessionId, toolCall: { toolCallId: "t2", title: "Write test_plan/00_overview.md" }, options: [
        { optionId: "allow_always", name: "Always allow", kind: "allow_always" },
        { optionId: "allow", name: "Allow once", kind: "allow_once" },
        { optionId: "reject", name: "Reject", kind: "reject_once" },
      ] } });
    } else if (msg.id === PERMISSION_ID && msg.result !== undefined) {
      // the browser's RESPONSE to our permission request → finish the turn
      note(sessionId, { sessionUpdate: "agent_message_chunk", content: { type: "text", text: " Done — the plan overview is written." } });
      await wait(200);
      if (promptId !== null) send({ jsonrpc: "2.0", id: promptId, result: { stopReason: "end_turn" } });
    }
  });
  ws.on("close", () => process.stderr.write("[hub] fake client disconnected\n"));
}

// --- HTTP + WS server ------------------------------------------------------

const CONTENT_TYPES: Record<string, string> = { json: "application/json; charset=utf-8", md: "text/markdown; charset=utf-8" };

export interface HubOptions {
  port?: number;
  /** Use the scripted fake agent instead of spawning the real adapter. */
  fake?: boolean;
}

export function startHub(opts: HubOptions = {}) {
  const port = opts.port ?? 5174;
  const attach = opts.fake ? attachFakeAgent : attachRealAgent;

  const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    // One error boundary so a single bad request (e.g. a malformed %-sequence
    // that makes decodeURIComponent throw) can't hang the socket or crash the
    // process via an unhandled rejection.
    handleHttp(req, res).catch((err) => {
      process.stderr.write(`[hub] request error: ${err instanceof Error ? err.message : String(err)}\n`);
      if (!res.headersSent) res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("bad request");
    });
  });

  async function handleHttp(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const url = new URL(req.url ?? "/", "http://localhost");
    const send = (code: number, type: string, body: string) => { res.writeHead(code, { "Content-Type": type }); res.end(body); };

    if (url.pathname === "/api/repos") {
      send(200, CONTENT_TYPES.json, JSON.stringify({ repos: await listRepos() }));
      return;
    }
    const list = url.pathname.match(/^\/api\/repos\/([^/]+)\/stories$/);
    if (list) {
      const dir = await storiesDirOf(decodeURIComponent(list[1]));
      if (dir === null) { send(404, CONTENT_TYPES.json, JSON.stringify({ error: "repo not found" })); return; }
      send(200, CONTENT_TYPES.json, JSON.stringify({ stories: await listStories(dir) }));
      return;
    }
    const one = url.pathname.match(/^\/api\/repos\/([^/]+)\/stories\/([^/]+)$/);
    if (one) {
      const dir = await storiesDirOf(decodeURIComponent(one[1]));
      if (dir === null) { send(404, CONTENT_TYPES.json, JSON.stringify({ error: "repo not found" })); return; }
      const md = await readStory(dir, decodeURIComponent(one[2]));
      if (md === null) { send(404, CONTENT_TYPES.json, JSON.stringify({ error: "story not found" })); return; }
      send(200, CONTENT_TYPES.md, md);
      return;
    }
    send(404, "text/plain; charset=utf-8", "not found");
  }

  const wss = new WebSocketServer({ server, path: "/ws/agent" });
  wss.on("connection", (ws) => attach(ws));
  server.on("error", (e) => process.stderr.write(`[hub] server error: ${e.message}\n`));

  return new Promise<ReturnType<typeof createServer>>((resolveListen) => {
    server.listen(port, () => resolveListen(server));
  });
}
