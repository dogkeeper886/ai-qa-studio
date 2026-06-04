/**
 * Hub tests. Three layers, all deterministic (no network, no agent credit):
 *  - stories: the markdown source-of-truth loaders, against a temp fixture.
 *  - http:    the API surface — shape, 404s, and the path-scope guard.
 *  - ws:      the fake agent's full ACP turn, end to end over a real WebSocket.
 *
 * Run: npm test  (node --import tsx --test).
 */

import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { WebSocket } from "ws";
import { startHub, listStories, readStory } from "./server.js";

// --- stories: the loaders, against a temp docs/stories fixture --------------

test("listStories + readStory load STORY-NNN files and skip the rest", async () => {
  const dir = await mkdtemp(join(tmpdir(), "hub-stories-"));
  try {
    await writeFile(join(dir, "STORY-001.md"), "# STORY-001: First\n\nbody\n");
    await writeFile(join(dir, "STORY-010-slug.md"), "# STORY-010: Tenth\n");
    await writeFile(join(dir, "STORY-002.md"), "no heading here\n"); // title falls back to id
    await writeFile(join(dir, "README.md"), "# not a story\n"); // must be ignored

    const list = await listStories(dir);
    assert.deepEqual(
      list.map((s) => s.id),
      ["STORY-001", "STORY-002", "STORY-010"], // numeric sort: 2 before 10, README excluded
    );
    assert.equal(list.find((s) => s.id === "STORY-001")?.title, "First"); // prefix stripped
    assert.equal(list.find((s) => s.id === "STORY-002")?.title, "STORY-002"); // no H1 → id

    assert.match((await readStory(dir, "STORY-010"))!, /Tenth/);
    assert.equal(await readStory(dir, "STORY-999"), null); // unknown id
    assert.equal(await readStory(dir, "../etc/passwd"), null); // id-shape guard
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

// --- the running hub (fake mode) -------------------------------------------

let server: Server;
let base: string; // http://127.0.0.1:<port>
let wsUrl: string;

before(async () => {
  server = await startHub({ port: 0, fake: true }); // port 0 = ephemeral
  const { port } = server.address() as AddressInfo;
  base = `http://127.0.0.1:${port}`;
  wsUrl = `ws://127.0.0.1:${port}/ws/agent`;
});

after(() => { server?.close(); });

// --- http: shape, 404s, and the path-scope guard ---------------------------

test("GET /api/cwd returns the agent's working directory", async () => {
  const res = await fetch(`${base}/api/cwd`);
  assert.equal(res.status, 200);
  const body = await res.json() as { cwd: string };
  assert.equal(typeof body.cwd, "string");
  assert.ok(body.cwd.endsWith("ai-qa-studio"), `cwd is the repo root, got ${body.cwd}`);
});

test("GET /api/repos returns a repos array", async () => {
  const res = await fetch(`${base}/api/repos`);
  assert.equal(res.status, 200);
  const body = await res.json() as { repos: unknown[] };
  assert.ok(Array.isArray(body.repos));
});

test("unknown repo and unknown route 404", async () => {
  assert.equal((await fetch(`${base}/api/repos/no-such-repo-xyz/stories`)).status, 404);
  assert.equal((await fetch(`${base}/api/nope`)).status, 404);
});

test("path-traversal in the repo segment is rejected", async () => {
  // '..' must never resolve outside active/. encodeURIComponent so it reaches the
  // handler as a single segment the shape guard can reject (not collapsed by the URL).
  const res = await fetch(`${base}/api/repos/${encodeURIComponent("..")}/stories`);
  assert.equal(res.status, 404);
});

// --- ws: the fake agent's full ACP turn ------------------------------------

/** Minimal ACP client over the hub WS: send requests, collect notifications,
 *  and answer the one server→client permission request. Resolves with the
 *  ordered list of session/update kinds and the prompt's stopReason. */
function runFakeTurn(): Promise<{ kinds: string[]; stopReason: string; sawPermission: boolean }> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    const kinds: string[] = [];
    let sawPermission = false;
    let nextId = 1;
    const idOf = { init: 0, newSession: 0, prompt: 0 };
    const send = (o: unknown) => ws.send(JSON.stringify(o));
    const timer = setTimeout(() => { ws.close(); reject(new Error("timeout waiting for end_turn")); }, 5000);

    ws.on("open", () => send({ jsonrpc: "2.0", id: (idOf.init = nextId++), method: "initialize", params: { protocolVersion: 1 } }));

    ws.on("message", (data) => {
      const msg = JSON.parse(data.toString());

      // server→client request: the permission ask. Answer allow_always.
      if (msg.method === "session/request_permission") {
        sawPermission = true;
        const opt = msg.params.options.find((o: any) => o.kind === "allow_always") ?? msg.params.options[0];
        send({ jsonrpc: "2.0", id: msg.id, result: { outcome: { outcome: "selected", optionId: opt.optionId } } });
        return;
      }
      // server→client notification: a session/update — record its kind.
      if (msg.method === "session/update") { kinds.push(msg.params.update.sessionUpdate); return; }

      // responses to our requests, matched by id.
      if (msg.id === idOf.init) {
        send({ jsonrpc: "2.0", id: (idOf.newSession = nextId++), method: "session/new", params: { cwd: "/", mcpServers: [] } });
      } else if (msg.id === idOf.newSession) {
        send({ jsonrpc: "2.0", id: (idOf.prompt = nextId++), method: "session/prompt", params: { sessionId: msg.result.sessionId, prompt: [{ type: "text", text: "go" }] } });
      } else if (msg.id === idOf.prompt) {
        clearTimeout(timer);
        ws.close();
        resolve({ kinds, stopReason: msg.result.stopReason, sawPermission });
      }
    });
    ws.on("error", (e) => { clearTimeout(timer); reject(e); });
  });
}

test("fake agent drives a full ACP turn: stream → permission → end_turn", async () => {
  const { kinds, stopReason, sawPermission } = await runFakeTurn();
  assert.ok(sawPermission, "the agent asked permission inline");
  assert.equal(stopReason, "end_turn");
  // session setup surfaces the command list; the turn streams text, a plan, and a tool call.
  assert.ok(kinds.includes("available_commands_update"), "commands surfaced after session/new");
  assert.ok(kinds.includes("agent_message_chunk"), "streamed agent text");
  assert.ok(kinds.includes("plan"), "streamed a plan");
  assert.ok(kinds.includes("tool_call"), "streamed a tool call");
});
