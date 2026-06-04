/**
 * Thread-reducer tests — the ACP event → component map, the one part of the
 * panel with real logic. Deterministic and DOM-free: it folds event objects, so
 * we feed it both hand-written shapes AND a replay of the REAL adapter stream
 * captured in the POC, and assert the resulting thread.
 *
 * Run: npm test  (node --import tsx --test).
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { initThread, threadReducer, type ThreadState, type Action, type ThreadItem, type ToolItem } from "./thread";

const apply = (actions: Action[], s: ThreadState = initThread()) => actions.reduce(threadReducer, s);
const updates = (us: any[]): Action[] => us.map((update) => ({ type: "update", update }));
const tools = (s: ThreadState) => s.items.filter((x): x is Extract<ThreadItem, { type: "tool" }> => x.type === "tool");
const agents = (s: ThreadState) => s.items.filter((x) => x.type === "agent");

test("streamed text chunks coalesce into one bubble; a thought is its own", () => {
  const s = apply(updates([
    { sessionUpdate: "agent_message_chunk", content: { type: "text", text: "Hel" } },
    { sessionUpdate: "agent_message_chunk", content: { type: "text", text: "lo" } },
    { sessionUpdate: "agent_thought_chunk", content: { type: "text", text: "hmm" } },
  ]));
  assert.equal(agents(s).length, 1);
  assert.equal((agents(s)[0] as any).text, "Hello");
  assert.equal(s.items.filter((x) => x.type === "thought").length, 1);
});

test("a tool call across its two phases stays ONE item, merging by id", () => {
  // Mirrors the real adapter: a pending 'Terminal' placeholder, then the titled
  // call carrying rawInput, then status/result updates — all one toolCallId.
  const s = apply(updates([
    { sessionUpdate: "tool_call", toolCallId: "t1", title: "Terminal", kind: "execute", status: "pending", rawInput: {} },
    { sessionUpdate: "tool_call", toolCallId: "t1", title: "`ls .claude/skills`", kind: "execute", status: "pending", rawInput: { command: "ls .claude/skills", description: "List skills" } },
    { sessionUpdate: "tool_call_update", toolCallId: "t1", status: "completed", rawOutput: "analyzing-logs\ncreating-demo" },
  ]));
  assert.equal(tools(s).length, 1, "one row, not three");
  const t = tools(s)[0].tool as ToolItem;
  assert.equal(t.name, "`ls .claude/skills`", "title from the second phase");
  assert.equal(t.input, "ls .claude/skills", "input pulled from rawInput.command");
  assert.equal(t.status, "completed", "status from the update");
  assert.match(t.output, /analyzing-logs/, "output from rawOutput");
});

test("ACP tool status maps to the qa-tool vocabulary", () => {
  const s = apply(updates([{ sessionUpdate: "tool_call", toolCallId: "t1", status: "pending", kind: "read" }]));
  assert.equal(tools(s)[0].tool.status, "queued"); // pending → queued
});

test("plan replaces in place and maps entry status to the marker vocab", () => {
  const s = apply(updates([
    { sessionUpdate: "plan", entries: [{ content: "A", status: "pending" }] },
    { sessionUpdate: "plan", entries: [{ content: "A", status: "completed" }, { content: "B", status: "in_progress" }] },
  ]));
  const plans = s.items.filter((x) => x.type === "plan");
  assert.equal(plans.length, 1, "one plan, updated in place");
  assert.deepEqual((plans[0] as any).entries, [{ content: "A", status: "done" }, { content: "B", status: "doing" }]);
});

test("available_commands_update populates the command list", () => {
  const s = apply(updates([{ sessionUpdate: "available_commands_update", availableCommands: [{ name: "jr-trace", description: "trace" }, { name: "tw-plan-init" }] }]));
  assert.deepEqual(s.commands.map((c) => c.name), ["jr-trace", "tw-plan-init"]);
});

test("permission then answer marks the same item answered", () => {
  let s = apply([{ type: "permission", reqId: 7, title: "Write x", options: [{ optionId: "a", name: "Allow", kind: "allow_once" }] }]);
  assert.equal(s.items.at(-1)!.type, "permission");
  s = threadReducer(s, { type: "answer", reqId: 7, answer: "Allow" });
  assert.equal((s.items.at(-1) as any).answer, "Allow");
});

test("a tool boundary closes the open text bubble (chunks after it start fresh)", () => {
  const s = apply(updates([
    { sessionUpdate: "agent_message_chunk", content: { type: "text", text: "before" } },
    { sessionUpdate: "tool_call", toolCallId: "t1", title: "x", status: "completed" },
    { sessionUpdate: "agent_message_chunk", content: { type: "text", text: "after" } },
  ]));
  assert.equal(agents(s).length, 2, "two separate bubbles around the tool");
});

test("replays the real captured adapter stream without loss", () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const samplePath = resolve(here, "../../../poc/acp/samples/probe-session-updates.ndjson");
  const lines: any[] = readFileSync(samplePath, "utf8").trim().split("\n").map((l: string) => JSON.parse(l).update);

  const s = apply(updates(lines));

  // 3 distinct toolCallIds in the capture → exactly 3 tool rows.
  const distinctIds = new Set(lines.filter((u: any) => u.toolCallId).map((u: any) => u.toolCallId));
  assert.equal(tools(s).length, distinctIds.size);
  // The big command list surfaced.
  assert.ok(s.commands.length > 10, "commands populated from the real stream");
  // The first tool is the Bash `ls .claude/skills`, input captured from rawInput.
  assert.equal(tools(s)[0].tool.input, "ls .claude/skills");
  assert.match(tools(s)[0].tool.output, /analyzing-logs/);
  // The final answer reached the last agent bubble.
  assert.match((agents(s).at(-1) as any).text, /written to/);
});
