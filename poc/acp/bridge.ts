/**
 * POC #10 — Thin ACP stdio <-> WebSocket bridge.
 *
 * The browser cannot spawn a child process or speak stdio. This bridge is the
 * only piece with no browser substitute: on each WS connection it spawns a
 * fresh claude-code-acp adapter and relays JSON-RPC between the agent's stdio
 * and the socket BYTE-FOR-BYTE — same newline-delimited JSON, only the
 * transport changes. No session registry, no permission logic, no transform.
 * That all lives in the protocol (the browser is the ACP client) — which is
 * exactly the point: the frontend renders a *standard*, not a bespoke shape.
 *
 * Run:  npm run bridge      then open http://localhost:5180
 */

import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { WebSocketServer } from "ws";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "../..");
const publicDir = resolve(here, "public");
const port = Number(process.env.PORT) || 5180;

const require = createRequire(import.meta.url);
const adapterEntry = resolve(
  dirname(require.resolve("@zed-industries/claude-code-acp/package.json")),
  "dist/index.js",
);

const CONTENT_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
};

const server = createServer(async (req, res) => {
  const path = new URL(req.url ?? "/", "http://localhost").pathname;
  // The browser needs an ABSOLUTE cwd for session/new (ACP requires it) but
  // can't know it — hand it our repo root. The bridge stays protocol-dumb.
  if (path === "/cwd") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ cwd: repoRoot }));
    return;
  }
  const file = path === "/" ? "index.html" : path.replace(/^\/+/, "");
  // Static only, scoped to public/ — defence against traversal.
  const abs = resolve(publicDir, file);
  if (!abs.startsWith(publicDir)) {
    res.writeHead(400).end("bad path");
    return;
  }
  try {
    const body = await readFile(abs);
    res.writeHead(200, { "Content-Type": CONTENT_TYPES[extname(abs)] ?? "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404).end("not found");
  }
});

const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", (ws) => {
  // One adapter process per socket — a session is the agent's lifetime here.
  // The adapter wraps the `claude` CLI, which refuses to launch nested inside a
  // Claude Code session — clear the markers so it runs standalone. Auth still
  // comes from ~/.claude credentials.
  const childEnv = { ...process.env };
  delete childEnv.CLAUDECODE;
  delete childEnv.CLAUDE_CODE_ENTRYPOINT;
  delete childEnv.CLAUDE_CODE_SSE_PORT;
  const child = spawn(process.execPath, [adapterEntry], {
    cwd: repoRoot,
    stdio: ["pipe", "pipe", "pipe"],
    env: childEnv,
  });
  process.stderr.write(`[bridge] client connected — spawned adapter pid=${child.pid}\n`);

  // agent stdout (NDJSON) -> WS, one frame per line, verbatim.
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
  // adapter diagnostics -> bridge stderr (not the protocol channel).
  child.stderr.on("data", (chunk: Buffer) => process.stderr.write(`[adapter] ${chunk}`));

  // WS -> agent stdin, verbatim + newline framing.
  ws.on("message", (data) => {
    const frame = typeof data === "string" ? data : data.toString("utf8");
    if (child.stdin.writable) child.stdin.write(frame.replace(/\n/g, "") + "\n");
  });

  const shutdown = (why: string) => {
    process.stderr.write(`[bridge] closing (${why}) — killing adapter pid=${child.pid}\n`);
    child.kill("SIGTERM");
    if (ws.readyState === ws.OPEN) ws.close();
  };
  ws.on("close", () => shutdown("ws closed"));
  ws.on("error", (e) => shutdown(`ws error: ${e.message}`));
  child.on("exit", (code, signal) => {
    process.stderr.write(`[bridge] adapter exited code=${code} signal=${signal}\n`);
    if (ws.readyState === ws.OPEN) ws.close(1000, "agent exited");
  });
});

server.listen(port, () => {
  process.stderr.write(`[bridge] http+ws on http://localhost:${port}  (adapter: ${adapterEntry})\n`);
});
