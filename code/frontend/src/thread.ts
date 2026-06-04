// The pure thread reducer for the assistant panel — the ACP event → component
// map, with no React or WebSocket in sight so it can be unit-tested against
// captured agent streams. The hook (agent.ts) owns the socket and dispatches
// into this; App.tsx renders the items.
//
// Shaped to the REAL adapter's events, not just the fake's: a tool call's input
// lives in `rawInput` (e.g. a Bash `command`), its kind in `_meta.claudeCode.
// toolName`, and it arrives in two phases (a pending placeholder, then the
// titled call, then status updates) under one toolCallId — so tool updates MERGE
// by id, keeping the last non-empty value for each field.

export interface ToolItem { id: string; name: string; kind: string; status: string; input: string; output: string; }
export interface PlanEntry { content: string; status: string; }
export interface Option { optionId: string; name: string; kind: string; }
export interface Command { name: string; description?: string }

export type ThreadItem =
  | { type: "user"; key: string; text: string }
  | { type: "agent"; key: string; text: string }
  | { type: "thought"; key: string; text: string }
  | { type: "tool"; key: string; tool: ToolItem }
  | { type: "plan"; key: string; entries: PlanEntry[] }
  | { type: "permission"; key: string; reqId: string | number; title: string; options: Option[]; answer?: string }
  | { type: "turn"; key: string; outcome: string };

export interface ThreadState {
  items: ThreadItem[];
  commands: Command[];
  /** The open agent/thought bubble streamed chunks append to; null at a boundary. */
  openKey: string | null;
  /** Monotonic key source — kept in state so the reducer stays pure. */
  seq: number;
}

export type Action =
  | { type: "update"; update: any } // a session/update payload
  | { type: "user"; text: string }
  | { type: "permission"; reqId: string | number; title: string; options: Option[] }
  | { type: "answer"; reqId: string | number; answer: string }
  | { type: "turn"; outcome: string }
  | { type: "closeBubble" }; // a prompt boundary ends the open text bubble

export function initThread(): ThreadState {
  return { items: [], commands: [], openKey: null, seq: 0 };
}

/** ACP `plan` status → the qa-plan data-s marker. */
const PLAN_STATUS: Record<string, string> = { completed: "done", in_progress: "doing", pending: "todo" };
/** ACP tool-call status → the qa-tool status vocabulary. */
const TOOL_STATUS: Record<string, string> = { pending: "queued", in_progress: "executing", completed: "completed", failed: "failed" };

/** ACP tool content blocks → a single text blob for the qa-tool body. */
function collectText(content: unknown): string {
  if (!Array.isArray(content)) return "";
  return content
    .map((c: any) => (c?.type === "content" && c.content?.type === "text" ? c.content.text
      : c?.type === "diff" ? `${c.path}\n${c.newText ?? ""}` : ""))
    .filter(Boolean)
    .join("\n");
}

/** A tool call's input for display: the Bash `command`, else the whole rawInput
 *  as JSON, else "" (the pending placeholder carries an empty object). */
function toolInput(rawInput: unknown): string {
  if (!rawInput || typeof rawInput !== "object") return "";
  const r = rawInput as Record<string, unknown>;
  if (typeof r.command === "string") return r.command;
  return Object.keys(r).length ? JSON.stringify(r) : "";
}

/** Fold one tool_call / tool_call_update into a ToolItem, merging onto a prior
 *  one (same id) and keeping the last non-empty value for each field. */
function foldTool(prev: ToolItem | undefined, u: any): ToolItem {
  // `kind` is the qa-tool glyph vocab (read|edit|search|execute|…) — ACP's own
  // `kind` field already speaks it; only the first event in the two-phase pair
  // carries it, so later updates keep the prior value.
  const input = toolInput(u.rawInput);
  const output = collectText(u.content) || (typeof u.rawOutput === "string" ? u.rawOutput : "");
  const status: string | undefined = u.status ? (TOOL_STATUS[u.status] ?? u.status) : undefined;
  if (!prev) {
    return { id: u.toolCallId, name: u.title ?? u.toolCallId, kind: u.kind ?? "execute", status: status ?? "queued", input, output };
  }
  return {
    ...prev,
    name: u.title ?? prev.name,
    kind: u.kind ?? prev.kind,
    status: status ?? prev.status,
    input: input || prev.input,
    output: output || prev.output,
  };
}

export function threadReducer(s: ThreadState, action: Action): ThreadState {
  const key = `i${s.seq}`;
  const next = (items: ThreadItem[], extra?: Partial<ThreadState>): ThreadState => ({ ...s, items, ...extra });

  switch (action.type) {
    case "closeBubble":
      return { ...s, openKey: null };

    case "user":
      return next([...s.items, { type: "user", key, text: action.text }], { seq: s.seq + 1, openKey: null });

    case "turn":
      return next([...s.items, { type: "turn", key, outcome: action.outcome }], { seq: s.seq + 1, openKey: null });

    case "permission":
      return next([...s.items, { type: "permission", key, reqId: action.reqId, title: action.title, options: action.options }], { seq: s.seq + 1, openKey: null });

    case "answer":
      return next(s.items.map((x) => (x.type === "permission" && x.reqId === action.reqId ? { ...x, answer: action.answer } : x)));

    case "update": {
      const u = action.update;
      switch (u?.sessionUpdate) {
        case "agent_message_chunk":
        case "agent_thought_chunk": {
          if (u.content?.type !== "text") return s;
          const thought = u.sessionUpdate === "agent_thought_chunk";
          const wantType = thought ? "thought" : "agent";
          const i = s.openKey ? s.items.findIndex((x) => x.key === s.openKey) : -1;
          if (i >= 0 && s.items[i].type === wantType) {
            const items = [...s.items];
            items[i] = { ...items[i], text: (items[i] as any).text + u.content.text } as ThreadItem;
            return next(items);
          }
          return next([...s.items, { type: wantType, key, text: u.content.text } as ThreadItem], { seq: s.seq + 1, openKey: key });
        }
        case "tool_call":
        case "tool_call_update": {
          const i = s.items.findIndex((x) => x.type === "tool" && x.tool.id === u.toolCallId);
          if (i >= 0) {
            const items = [...s.items];
            items[i] = { ...items[i], tool: foldTool((items[i] as any).tool, u) } as ThreadItem;
            return next(items, { openKey: null });
          }
          return next([...s.items, { type: "tool", key, tool: foldTool(undefined, u) }], { seq: s.seq + 1, openKey: null });
        }
        case "plan": {
          const entries: PlanEntry[] = (u.entries ?? []).map((e: any) => ({ content: e.content, status: PLAN_STATUS[e.status] ?? "todo" }));
          const i = s.items.findIndex((x) => x.type === "plan");
          if (i >= 0) {
            const items = [...s.items];
            items[i] = { ...items[i], entries } as ThreadItem;
            return next(items, { openKey: null });
          }
          return next([...s.items, { type: "plan", key, entries }], { seq: s.seq + 1, openKey: null });
        }
        case "available_commands_update":
          return { ...s, commands: (u.availableCommands ?? []).map((c: any) => ({ name: c.name, description: c.description })) };
        default:
          return s;
      }
    }
  }
}
