# poc/acp — ACP loop spike (issues #9, #10)

**Throwaway spike.** Proves the Zed-style **Agent Client Protocol (ACP)** loop works for
AI QA Studio before committing to it: Claude runs as an ACP agent over our `.claude`
run-surface, and a browser drives it over a WebSocket bridge. The deliverable is a
yes/no answer plus a captured event sample — not production code.

```
Claude Agent SDK + our .claude/ skills
   │  (@zed-industries/claude-code-acp wraps it as an ACP agent)
   ▼  stdio · JSON-RPC 2.0 newline-delimited
 probe.ts (#9)        OR        bridge.ts (#10)  ──spawn + relay stdio──►  WebSocket
   ▼ prints session/update                              ▼  same JSON-RPC, verbatim
 saves a sample                                  public/index.html — session/update → DOM
```

## Why a bridge at all

A browser cannot spawn a child process or speak stdio — the one thing with no browser
substitute. The bridge spawns the ACP agent and relays its stdio JSON-RPC over a
WebSocket **byte-for-byte** (same newline-delimited JSON, only the transport changes).
Everything else — sessions, permissions, the turn lifecycle — is in the *protocol*, so
the browser is a real ACP client and renders a **standard**, not a bespoke event shape.

## Stack (pinned)

- `@zed-industries/claude-code-acp@0.16.2` — Claude-as-ACP-agent adapter (stdio).
  (npm-renamed to `@agentclientprotocol/claude-agent-acp`; 0.16.2 matches the SDK below.)
- `@agentclientprotocol/sdk@0.14.1` — the ACP TypeScript SDK (client side). Same version
  the adapter bundles, so the `initialize` handshake agrees on protocol version.

## Prerequisites

1. **Auth** — local Claude Code credentials (`~/.claude/.credentials.json`). The adapter
   inherits them; no `ANTHROPIC_API_KEY` needed.
2. **Run-surface** — the agent reads `.claude/skills` + `.claude/commands` from the repo
   root. Those dirs are gitignored; (re)build them from `workflow/` with:
   ```bash
   ../../scripts/link-runsurface.sh      # see that script; links workflow/ → .claude/
   ```
3. `npm install` in this directory.

> The adapter wraps the `claude` CLI, which refuses to launch **nested** inside a Claude
> Code session. Both `probe.ts` and `bridge.ts` spawn it with `CLAUDECODE` unset so it
> runs standalone.

## #9 — probe (no UI)

```bash
npm run probe                 # or: npm run probe -- "your own prompt"
```
Spawns the adapter, runs one `session/prompt`, prints every `session/update`, answers the
`session/request_permission`, and saves the raw updates to
`samples/probe-session-updates.ndjson`. Prints a verdict line (tool_call seen / permission
round-trip / stopReason).

## #10 — bridge + browser

```bash
npm run bridge                # http+ws on http://localhost:5180
```
Open <http://localhost:5180>, click **Run turn**. Left pane renders the thread
(`session/update` → components); right pane logs every JSON-RPC frame verbatim (the
pass-through proof). Permission requests render as buttons you click to continue.

## Scope / non-goals

- Rough code, one process per socket, no reconnect/history/multi-session.
- No React — vanilla JS proves the loop, not the UI. A React `session/update` → component
  map is the next step, not this spike.
- The bridge does **no** protocol logic (no session registry / dedup / safelist) — ACP's
  permission model (`allow_once`/`allow_always`/…) subsumes r1's hand-rolled machinery.
