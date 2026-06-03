// The ACP runtime for the assistant panel. The browser IS the ACP client: it
// speaks JSON-RPC over the hub's WebSocket (the proven POC bridge — initialize →
// session/new → session/prompt) and folds the streamed `session/update` events
// into a thread the panel renders. Works against the hub's fake agent (HUB_FAKE,
// no credit) or the real adapter — same protocol either way.
import { useCallback, useEffect, useRef, useState } from "react";

export interface ToolItem { id: string; name: string; kind: string; status: string; output: string; }
export interface PlanEntry { content: string; status: string; }
export interface Option { optionId: string; name: string; kind: string; }
export interface Command { name: string; description?: string }

export type ThreadItem =
  | { type: "user"; key: string; text: string }
  | { type: "agent"; key: string; text: string }
  | { type: "thought"; key: string; text: string }
  | { type: "act"; key: string; text: string }
  | { type: "tool"; key: string; tool: ToolItem }
  | { type: "plan"; key: string; entries: PlanEntry[] }
  | { type: "permission"; key: string; reqId: string | number; title: string; options: Option[]; answer?: string }
  | { type: "turn"; key: string; outcome: string };

export type AgentStatus = "connecting" | "ready" | "running" | "error" | "closed";

interface JsonRpc { id?: string | number; method?: string; result?: unknown; error?: unknown; params?: any }

/** ACP `plan` status → the qa-plan data-s marker. */
const PLAN_STATUS: Record<string, string> = { completed: "done", in_progress: "doing", pending: "todo" };
/** ACP tool content blocks → a single text blob for the qa-tool body. */
function collectText(content: unknown): string {
  if (!Array.isArray(content)) return "";
  return content
    .map((c: any) => (c?.type === "content" && c.content?.type === "text" ? c.content.text
      : c?.type === "diff" ? `${c.path}\n${c.newText ?? ""}` : ""))
    .filter(Boolean)
    .join("\n");
}

export function useAgent() {
  const [items, setItems] = useState<ThreadItem[]>([]);
  const [commands, setCommands] = useState<Command[]>([]);
  const [status, setStatus] = useState<AgentStatus>("connecting");

  const ws = useRef<WebSocket | null>(null);
  const nextId = useRef(1);
  const seq = useRef(0); // monotonic key source for thread items
  const sessionId = useRef<string | null>(null);
  const initialized = useRef(false);
  const curAgentKey = useRef<string | null>(null); // the open agent bubble to append chunks to

  const k = () => `i${seq.current++}`;

  const send = useCallback((o: unknown) => {
    const s = ws.current;
    if (s && s.readyState === WebSocket.OPEN) s.send(JSON.stringify(o));
  }, []);

  const pending = useRef(new Map<number, (r: any) => void>());
  const request = useCallback((method: string, params: unknown) => {
    const id = nextId.current++;
    send({ jsonrpc: "2.0", id, method, params });
    return new Promise<any>((resolve) => pending.current.set(id, resolve));
  }, [send]);

  // --- fold one session/update into the thread ------------------------------
  const applyUpdate = useCallback((u: any) => {
    switch (u?.sessionUpdate) {
      case "agent_message_chunk":
      case "agent_thought_chunk": {
        if (u.content?.type !== "text") return;
        const thought = u.sessionUpdate === "agent_thought_chunk";
        setItems((prev) => {
          const cur = curAgentKey.current;
          const i = cur ? prev.findIndex((x) => x.key === cur) : -1;
          if (i >= 0 && prev[i].type === (thought ? "thought" : "agent")) {
            const cp = [...prev]; cp[i] = { ...cp[i], text: (cp[i] as any).text + u.content.text } as ThreadItem; return cp;
          }
          const key = k(); curAgentKey.current = key;
          return [...prev, { type: thought ? "thought" : "agent", key, text: u.content.text } as ThreadItem];
        });
        break;
      }
      case "tool_call":
      case "tool_call_update": {
        curAgentKey.current = null; // a tool boundary ends the open text bubble
        const t: ToolItem = { id: u.toolCallId, name: u.title ?? u.toolCallId, kind: (u.kind ?? "execute"), status: u.status ?? "completed", output: collectText(u.content) };
        setItems((prev) => {
          const i = prev.findIndex((x) => x.type === "tool" && x.tool.id === t.id);
          if (i >= 0) { const cp = [...prev]; const old = (cp[i] as any).tool as ToolItem; cp[i] = { ...cp[i], tool: { ...old, ...t, output: t.output || old.output } } as ThreadItem; return cp; }
          return [...prev, { type: "tool", key: k(), tool: t }];
        });
        break;
      }
      case "plan": {
        curAgentKey.current = null;
        const entries: PlanEntry[] = (u.entries ?? []).map((e: any) => ({ content: e.content, status: PLAN_STATUS[e.status] ?? "todo" }));
        setItems((prev) => {
          const i = prev.findIndex((x) => x.type === "plan");
          if (i >= 0) { const cp = [...prev]; cp[i] = { ...cp[i], entries } as ThreadItem; return cp; }
          return [...prev, { type: "plan", key: k(), entries }];
        });
        break;
      }
      case "available_commands_update":
        setCommands((u.availableCommands ?? []).map((c: any) => ({ name: c.name, description: c.description })));
        break;
    }
  }, []);

  const handle = useCallback((msg: JsonRpc) => {
    if (msg.id !== undefined && (msg.result !== undefined || msg.error !== undefined)) {
      const r = pending.current.get(msg.id as number); pending.current.delete(msg.id as number);
      r?.(msg.result);
      return;
    }
    if (msg.method === "session/request_permission" && msg.id !== undefined) {
      curAgentKey.current = null;
      const tc = msg.params?.toolCall;
      setItems((prev) => [...prev, { type: "permission", key: k(), reqId: msg.id!, title: tc?.title ?? "tool call", options: msg.params?.options ?? [] }]);
      return;
    }
    if (msg.method && msg.id !== undefined) { // an unsupported server→client request
      send({ jsonrpc: "2.0", id: msg.id, error: { code: -32601, message: `unsupported: ${msg.method}` } });
      return;
    }
    if (msg.method === "session/update") applyUpdate(msg.params?.update);
  }, [applyUpdate, send]);

  useEffect(() => {
    const sock = new WebSocket(`ws://${location.host}/ws/agent`);
    ws.current = sock;
    sock.onopen = () => setStatus("ready");
    sock.onclose = () => setStatus((s) => (s === "error" ? s : "closed"));
    sock.onerror = () => setStatus("error");
    sock.onmessage = (ev) => { try { handle(JSON.parse(ev.data)); } catch { /* ignore non-JSON frames */ } };
    return () => sock.close();
  }, [handle]);

  /** Send one prompt turn (lazily initializing the session on first use). */
  const sendPrompt = useCallback(async (text: string) => {
    if (!text.trim() || status === "running") return;
    setItems((prev) => [...prev, { type: "user", key: k(), text }]);
    curAgentKey.current = null;
    setStatus("running");
    try {
      if (!initialized.current) {
        await request("initialize", { protocolVersion: 1, clientCapabilities: { fs: { readTextFile: false, writeTextFile: false }, terminal: false }, clientInfo: { name: "ai-qa-studio", version: "0.0.1" } });
        initialized.current = true;
      }
      if (!sessionId.current) {
        const { cwd } = await (await fetch("/api/cwd")).json();
        const r = await request("session/new", { cwd, mcpServers: [] });
        sessionId.current = r?.sessionId ?? null;
      }
      const res = await request("session/prompt", { sessionId: sessionId.current, prompt: [{ type: "text", text }] });
      setItems((prev) => [...prev, { type: "turn", key: k(), outcome: res?.stopReason ?? "end_turn" }]);
    } catch {
      setItems((prev) => [...prev, { type: "turn", key: k(), outcome: "error" }]);
    } finally {
      curAgentKey.current = null;
      setStatus("ready");
    }
  }, [request, status]);

  /** Answer a pending permission request inline. */
  const respondPermission = useCallback((reqId: string | number, opt: Option) => {
    send({ jsonrpc: "2.0", id: reqId, result: { outcome: { outcome: "selected", optionId: opt.optionId } } });
    setItems((prev) => prev.map((x) => (x.type === "permission" && x.reqId === reqId ? { ...x, answer: opt.name } : x)));
  }, [send]);

  return { items, commands, status, sendPrompt, respondPermission };
}
