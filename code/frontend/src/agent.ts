// The ACP runtime for the assistant panel. The browser IS the ACP client: it
// speaks JSON-RPC over the hub's WebSocket (the proven POC bridge — initialize →
// session/new → session/prompt) and dispatches the streamed `session/update`
// events into the pure thread reducer (thread.ts), which the panel renders.
// Works against the hub's fake agent (HUB_FAKE, no credit) or the real adapter —
// same protocol either way.
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { initThread, threadReducer, type Option } from "./thread";

export type { ToolItem, PlanEntry, Option, Command, ThreadItem } from "./thread";
export type AgentStatus = "connecting" | "ready" | "running" | "error" | "closed";

/** A file attached from the composer, sent as embedded ACP context. */
export interface Attachment { name: string; text: string; }

interface JsonRpc { id?: string | number; method?: string; result?: unknown; error?: unknown; params?: any }

export function useAgent() {
  const [state, dispatch] = useReducer(threadReducer, undefined, initThread);
  const [status, setStatus] = useState<AgentStatus>("connecting");

  const ws = useRef<WebSocket | null>(null);
  const nextId = useRef(1);
  const sessionId = useRef<string | null>(null);
  const initialized = useRef(false);

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

  const handle = useCallback((msg: JsonRpc) => {
    if (msg.id !== undefined && (msg.result !== undefined || msg.error !== undefined)) {
      const r = pending.current.get(msg.id as number); pending.current.delete(msg.id as number);
      r?.(msg.result);
      return;
    }
    if (msg.method === "session/request_permission" && msg.id !== undefined) {
      const tc = msg.params?.toolCall;
      dispatch({ type: "permission", reqId: msg.id, title: tc?.title ?? "tool call", options: msg.params?.options ?? [] });
      return;
    }
    if (msg.method && msg.id !== undefined) { // an unsupported server→client request
      send({ jsonrpc: "2.0", id: msg.id, error: { code: -32601, message: `unsupported: ${msg.method}` } });
      return;
    }
    if (msg.method === "session/update") dispatch({ type: "update", update: msg.params?.update });
  }, [send]);

  useEffect(() => {
    // Open in a deferred task, not synchronously. Each connection spawns a real
    // agent adapter on the hub, and StrictMode mounts effects twice in dev
    // (mount → unmount → remount); a synchronous open would spawn two adapters,
    // killing one immediately. Deferring lets the cleanup cancel the first
    // attempt before it opens, so the cycle collapses to a single connection.
    let sock: WebSocket | null = null;
    let cancelled = false;
    const open = setTimeout(() => {
      if (cancelled) return;
      sock = new WebSocket(`ws://${location.host}/ws/agent`);
      ws.current = sock;
      sock.onopen = () => setStatus("ready");
      sock.onclose = () => setStatus((s) => (s === "error" ? s : "closed"));
      sock.onerror = () => setStatus("error");
      sock.onmessage = (ev) => { try { handle(JSON.parse(ev.data)); } catch { /* ignore non-JSON frames */ } };
    }, 0);
    return () => { cancelled = true; clearTimeout(open); sock?.close(); };
  }, [handle]);

  /** Send one prompt turn (lazily initializing the session on first use).
   *  Attachments ride along as embedded `resource` content blocks ahead of the
   *  text — the agent advertises embeddedContext support. */
  const sendPrompt = useCallback(async (text: string, attachments: Attachment[] = []) => {
    const trimmed = text.trim();
    if ((!trimmed && attachments.length === 0) || status === "running") return;
    const label = attachments.length ? `${trimmed}${trimmed ? " " : ""}📎 ${attachments.map((a) => a.name).join(", ")}` : trimmed;
    dispatch({ type: "user", text: label });
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
      const prompt = [
        ...attachments.map((a) => ({ type: "resource", resource: { uri: `file://${a.name}`, mimeType: "text/plain", text: a.text } })),
        ...(trimmed ? [{ type: "text", text: trimmed }] : []),
      ];
      const res = await request("session/prompt", { sessionId: sessionId.current, prompt });
      dispatch({ type: "turn", outcome: res?.stopReason ?? "end_turn" });
    } catch {
      dispatch({ type: "turn", outcome: "error" });
    } finally {
      dispatch({ type: "closeBubble" });
      setStatus("ready");
    }
  }, [request, status]);

  /** Answer a pending permission request inline. */
  const respondPermission = useCallback((reqId: string | number, opt: Option) => {
    send({ jsonrpc: "2.0", id: reqId, result: { outcome: { outcome: "selected", optionId: opt.optionId } } });
    dispatch({ type: "answer", reqId, answer: opt.name });
  }, [send]);

  return { items: state.items, commands: state.commands, status, sendPrompt, respondPermission };
}
