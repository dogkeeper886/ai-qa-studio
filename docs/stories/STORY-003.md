# STORY-003: Stand up the studio foundation

## User Story

As the team building AI QA Studio,
I want a running studio app to build features on,
So that feature stories (seeing the stories, chatting with the agent) have a foundation
instead of each one re-standing-up the app.

## The Need

The feature stories can't exist without a studio that actually runs: a web GUI shell
over the markdown source of truth, the design framework rendering, a local hub serving
the workspace and able to run an agent session, and the UI design + review tooling
available. That's **shared plumbing**, not any single user feature — so it deserves its
own story. Splitting it out keeps the feature stories honest: each is just its feature,
sitting on this foundation.

## Success Looks Like

- The studio **boots locally** and opens to a working shell.
- The **design framework renders** (the shared tokens/components, not bespoke styling).
- The **hub serves the workspace** files and can **run an agent session**.
- The **UI design + review skills** are available to design and gate screens.

## Open Questions

The *how* — worked out on the issues:

- Stack is **React + Vite + TS** (confirmed, carried from r1).
- **Lean-rebuild the hub** reusing r1's proven patterns (Agent-SDK streaming, WS
  pass-through, file serving, permission safelist), de-R1'd — not a verbatim port.
- A **fake-query dev mode** so the UI can be built without burning SDK credit.
- How the **design/review skills** wire into the `.claude/` run-surface.
- Desktop packaging (Tauri) is deferred — local web app for now.

## Status

- Created: 2026-06-02
- Issues: #2, #3
