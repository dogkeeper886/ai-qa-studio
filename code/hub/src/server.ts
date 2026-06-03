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
import { readFile, readdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { WebSocketServer, type WebSocket } from "ws";

const here = dirname(fileURLToPath(import.meta.url));
/** code/hub/src -> repo root. The agent runs here so .claude/ skills load. */
export const repoRoot = resolve(here, "../../..");
const storiesDir = resolve(repoRoot, "docs/stories");

// --- docs/stories: the markdown source of truth ----------------------------

const STORY_FILE_RE = /^(STORY-\d+)[^/]*\.md$/;

export interface StoryListing {
  /** STORY-NNN — the id used in /api/stories/:id. */
  id: string;
  /** File name under docs/stories/. */
  file: string;
  /** First-heading title, minus the "STORY-NNN: " prefix. */
  title: string;
}

/** List the real stories (STORY-NNN*.md), skipping README and the like. */
export async function listStories(): Promise<StoryListing[]> {
  let files: string[];
  try {
    files = await readdir(storiesDir);
  } catch {
    return [];
  }
  const out: StoryListing[] = [];
  for (const file of files) {
    const m = file.match(STORY_FILE_RE);
    if (!m) continue;
    const id = m[1];
    let title = id;
    try {
      const text = await readFile(join(storiesDir, file), "utf8");
      const h1 = text.match(/^#\s+(.+?)\s*$/m)?.[1];
      if (h1) title = h1.replace(/^STORY-\d+:\s*/, "");
    } catch {
      /* keep id as title */
    }
    out.push({ id, file, title });
  }
  out.sort((a, b) => a.id.localeCompare(b.id));
  return out;
}

/** Read one story's raw markdown by id. Returns null if unknown/escaping. */
export async function readStory(id: string): Promise<string | null> {
  if (!/^STORY-\d+$/.test(id)) return null; // id-shape guard = path-scope safety
  const stories = await listStories();
  const hit = stories.find((s) => s.id === id);
  if (!hit) return null;
  try {
    return await readFile(join(storiesDir, hit.file), "utf8");
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
  let promptId: string | number | null = null; // the open session/prompt awaiting our result

  ws.on("message", async (data) => {
    let msg: { id?: string | number; method?: string };
    try { msg = JSON.parse(typeof data === "string" ? data : data.toString("utf8")); } catch { return; }

    if (msg.method === "initialize") {
      send({ jsonrpc: "2.0", id: msg.id, result: { protocolVersion: 1, agentInfo: { name: "fake-agent", title: "Fake (dev)", version: "0.0.1" }, agentCapabilities: {} } });
    } else if (msg.method === "session/new") {
      send({ jsonrpc: "2.0", id: msg.id, result: { sessionId } });
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
      send({ jsonrpc: "2.0", id: 0, method: "session/request_permission", params: { sessionId, toolCall: { toolCallId: "t2", title: "Write test_plan/00_overview.md" }, options: [
        { optionId: "allow_always", name: "Always allow", kind: "allow_always" },
        { optionId: "allow", name: "Allow once", kind: "allow_once" },
        { optionId: "reject", name: "Reject", kind: "reject_once" },
      ] } });
    } else if (msg.id === 0) {
      // the browser's answer to our permission request → finish the turn
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
    void handleHttp(req, res);
  });

  async function handleHttp(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const url = new URL(req.url ?? "/", "http://localhost");
    const send = (code: number, type: string, body: string) => { res.writeHead(code, { "Content-Type": type }); res.end(body); };

    if (url.pathname === "/api/stories") {
      send(200, CONTENT_TYPES.json, JSON.stringify({ stories: await listStories() }));
      return;
    }
    const m = url.pathname.match(/^\/api\/stories\/([^/]+)$/);
    if (m) {
      const md = await readStory(decodeURIComponent(m[1]));
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
