# STORY-002: Talk to the AI agent in the studio

## User Story

As a person using the studio,
I want to talk to the AI agent in a panel and watch its work live,
So that I can drive QA/dev tasks from inside the studio instead of a separate IDE.

## The Need

The studio's whole premise is AI-driven, but there's no way to actually *converse*
with the agent in it yet. The user needs to send a request, see what the agent is
doing as it works, answer it when it needs a decision, and review what it produces —
all without leaving the product. Standing this up also proves the
frontend ↔ hub ↔ Agent-SDK loop end to end, which is why it comes early.

## Success Looks Like

- Open the assistant panel, type a request, and send it.
- The agent's activity streams in live: its messages, and each **tool call shown as
  an inspectable, collapsible step** (name, input, result) — not a wall of text.
- When the agent needs **permission or a decision**, the user answers it **inline in
  the thread** and the agent continues; a decision, once given, isn't asked again.
- When the agent **produces an artifact** (a plan, test cases, a story, a file), the
  studio shows it as a **reviewable preview the user can approve or send back to
  iterate** — the chat turn and the review gate are two views of the same thing.
- When a turn ends, it **collapses to a summary** (outcome, cost, turns, anything
  that was denied).
- The user can **attach context** (point at a story or file) and **run commands**
  from the composer.

## Open Questions

The *how* — to be worked out on the issue (research / PoC / decisions):

- The **frontend ↔ hub event contract** as a documented interface, so the UI stays
  decoupled from Agent-SDK internals (swappable/fake-able agent).
- Render the thread as a strict **event-type → component map**, not ad-hoc text
  formatting — likely **assistant-ui** via a custom runtime over the hub's WebSocket
  stream (confirm the fit). Zed/Cursor/ACP are UX/protocol references only, not code
  to port.
- How produced **artifacts/diffs are rendered** and tied to the review gate.
- **Permission UX** — safelist + remembered decisions.
- **Session history** and multiple sessions.
- A **fake-query dev mode** so the panel can be built without burning SDK credit.

## Status

- Created: 2026-06-02
- Issues: #12 (wireframe) ✓ merged (#14), #13 (build) ✓ merged (#28), #27 (artifact preview / review-gate — AC3, open)
