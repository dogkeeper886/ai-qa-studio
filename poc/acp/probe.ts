/**
 * POC #9 — Run Claude as an ACP agent against our .claude run-surface.
 *
 * Spawns the claude-code-acp adapter as a stdio child, drives one prompt turn
 * through the ACP TypeScript SDK (ClientSideConnection), prints every
 * session/update notification, answers the one session/request_permission, and
 * saves the raw update stream as a sample to seed the renderer later.
 *
 * This is the ACP-native analogue of r1's L0 hello-agent probe: the smallest
 * move that proves our methodology runs under ACP before any bridge or UI.
 *
 * Run:  npm run probe  -- "optional custom prompt"
 */

import { spawn } from "node:child_process";
import { Readable, Writable } from "node:stream";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ClientSideConnection,
  ndJsonStream,
  PROTOCOL_VERSION,
  type Client,
  type RequestPermissionRequest,
  type RequestPermissionResponse,
  type ReadTextFileRequest,
  type ReadTextFileResponse,
  type WriteTextFileRequest,
  type WriteTextFileResponse,
  type SessionNotification,
} from "@agentclientprotocol/sdk";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "../..");

// Resolve the adapter's entry from its package.json `bin`, then run it under the
// current node — avoids depending on the .bin shim / PATH / shebang quirks.
const require = createRequire(import.meta.url);
const adapterPkg = require.resolve("@zed-industries/claude-code-acp/package.json");
const adapterEntry = resolve(dirname(adapterPkg), "dist/index.js");

const userPrompt =
  process.argv.slice(2).join(" ").trim() ||
  // Exercises both #9 criteria in one turn: a Bash tool_call that reads our
  // run-surface, then a Write to a NEW file — writes aren't on the host
  // allow-list, so the adapter gates them through session/request_permission.
  "First use the Bash tool to run `ls .claude/skills` and count the skill directories. " +
  "Then use the Write tool to create the file poc/acp/samples/permission-check.txt " +
  "containing exactly one line: that count. Reply in one short sentence.";

function preview(s: string, n = 140): string {
  const flat = s.replace(/\s+/g, " ").trim();
  return flat.length > n ? flat.slice(0, n) + "…" : flat;
}

/** One-line human summary of a session/update for the console. */
function summarize(update: SessionNotification["update"]): string {
  switch (update.sessionUpdate) {
    case "agent_message_chunk":
    case "agent_thought_chunk":
    case "user_message_chunk": {
      const c = update.content;
      return c.type === "text" ? preview(c.text) : `(${c.type})`;
    }
    case "tool_call":
      return `${update.title ?? update.toolCallId} [kind=${update.kind ?? "?"} status=${update.status ?? "?"}]`;
    case "tool_call_update":
      return `${update.toolCallId} -> status=${update.status ?? "?"}`;
    case "plan":
      return `${update.entries.length} entr${update.entries.length === 1 ? "y" : "ies"}`;
    case "available_commands_update":
      return `${update.availableCommands.length} commands`;
    default:
      return preview(JSON.stringify(update));
  }
}

/** Env for the spawned adapter. The adapter wraps the `claude` CLI, which
 *  refuses to launch nested inside a Claude Code session — clear the markers so
 *  it runs as a standalone agent. Auth still comes from ~/.claude credentials. */
function adapterEnv(): NodeJS.ProcessEnv {
  const env = { ...process.env };
  delete env.CLAUDECODE;
  delete env.CLAUDE_CODE_ENTRYPOINT;
  delete env.CLAUDE_CODE_SSE_PORT;
  return env;
}

async function main() {
  const child = spawn(process.execPath, [adapterEntry], {
    cwd: repoRoot,
    stdio: ["pipe", "pipe", "inherit"], // stderr inherited so adapter logs are visible
    env: adapterEnv(),
  });
  child.on("exit", (code, signal) => {
    process.stderr.write(`[probe] adapter exited code=${code} signal=${signal}\n`);
  });
  // Never orphan the adapter — kill it on ANY exit path (success, throw, or a
  // SIGTERM/SIGINT from a `timeout` wrapper). The signal traps re-exit so the
  // "exit" handler runs.
  const killChild = () => { try { child.kill("SIGKILL"); } catch { /* already gone */ } };
  process.on("exit", killChild);
  process.on("SIGINT", () => process.exit(130));
  process.on("SIGTERM", () => process.exit(143));

  // ndJsonStream(output→agent stdin, input←agent stdout).
  const stream = ndJsonStream(
    Writable.toWeb(child.stdin!) as WritableStream<Uint8Array>,
    Readable.toWeb(child.stdout!) as ReadableStream<Uint8Array>,
  );

  const rawUpdates: string[] = [];
  const counts: Record<string, number> = {};
  let sawPermission = false;

  const client: Client = {
    async sessionUpdate(params: SessionNotification): Promise<void> {
      rawUpdates.push(JSON.stringify(params));
      const kind = params.update.sessionUpdate;
      counts[kind] = (counts[kind] ?? 0) + 1;
      console.log(`  • ${kind.padEnd(22)} ${summarize(params.update)}`);
    },
    async requestPermission(
      params: RequestPermissionRequest,
    ): Promise<RequestPermissionResponse> {
      sawPermission = true;
      const tool = params.toolCall.title ?? params.toolCall.toolCallId;
      const ids = params.options.map((o) => `${o.optionId}(${o.kind})`).join(", ");
      console.log(`\n[permission] agent asks to run: ${tool}`);
      console.log(`[permission] options: ${ids}`);
      // Auto-pick an allow option (prefer allow_once) — the spike answers itself.
      const choice =
        params.options.find((o) => o.kind === "allow_once") ??
        params.options.find((o) => o.kind.startsWith("allow")) ??
        params.options[0];
      console.log(`[permission] selecting: ${choice.optionId}\n`);
      return { outcome: { outcome: "selected", optionId: choice.optionId } };
    },
    // fs/* — the adapter may read/write through the client. Back them with the
    // real filesystem so the agent's edits behave like an editor's.
    async readTextFile(params: ReadTextFileRequest): Promise<ReadTextFileResponse> {
      return { content: await readFile(params.path, "utf8") };
    },
    async writeTextFile(params: WriteTextFileRequest): Promise<WriteTextFileResponse> {
      await writeFile(params.path, params.content, "utf8");
      return {};
    },
  };

  const conn = new ClientSideConnection(() => client, stream);

  console.log(`[probe] adapter: ${adapterEntry}`);
  console.log(`[probe] cwd:     ${repoRoot}`);

  const init = await conn.initialize({
    protocolVersion: PROTOCOL_VERSION,
    clientCapabilities: { fs: { readTextFile: true, writeTextFile: true }, terminal: false },
    clientInfo: { name: "aiqa-acp-poc", version: "0.0.1" },
  });
  console.log(`[probe] initialized — agent protocolVersion=${init.protocolVersion}`);

  const session = await conn.newSession({ cwd: repoRoot, mcpServers: [] });
  console.log(`[probe] session: ${session.sessionId}`);
  console.log(`[probe] prompt:  ${preview(userPrompt)}\n--- session/update stream ---`);

  const res = await conn.prompt({
    sessionId: session.sessionId,
    prompt: [{ type: "text", text: userPrompt }],
  });

  console.log(`\n--- turn complete --- stopReason=${res.stopReason}`);
  console.log(`[probe] update tally:`, counts);

  const sampleDir = resolve(here, "samples");
  await mkdir(sampleDir, { recursive: true });
  const samplePath = resolve(sampleDir, "probe-session-updates.ndjson");
  await writeFile(samplePath, rawUpdates.join("\n") + "\n", "utf8");
  console.log(`[probe] saved ${rawUpdates.length} updates -> ${samplePath}`);

  // Verdict against the issue's acceptance criteria.
  const sawToolCall = (counts["tool_call"] ?? 0) > 0;
  console.log(`\n[verdict] tool_call seen: ${sawToolCall} | permission round-trip: ${sawPermission} | stopReason: ${res.stopReason}`);

  child.kill("SIGTERM");
  process.exit(0);
}

main().catch((err) => {
  console.error("[probe] FAILED:", err instanceof Error ? (err.stack ?? err.message) : err);
  process.exit(1);
});
