# STORY-006: Run the studio from one front door

## User Story

As a person working on the studio,
I want a single place that gathers the product's run commands — spin up, spin down, and the rest,
So that I can start and stop the whole thing without remembering which process goes in which terminal.

## The Need

Running the studio today means juggling scattered commands across three places: the
hub (`make serve` / `serve-fake` in `code/hub/`), the frontend (`make dev` in
`code/frontend/`), and the wireframes (`scripts/wireframes.sh`). Starting it is two
terminals and two `make`s; stopping it has no command at all — you hunt down the
background processes and kill them by hand. There is no top-level front door, so the
first thing a newcomer (or a returning developer) has to do is rediscover the layout.

The product should have **one obvious entry point** that gathers its run commands in
one place — so "start the studio", "stop the studio", and "preview the wireframes" are
single, discoverable commands, not tribal knowledge spread across READMEs.

## Success Looks Like

- One command brings the whole studio up (hub + frontend together) and tells you where it's running.
- One command brings it cleanly back down — no leftover processes to hunt for.
- Previewing the wireframes is a command from the same front door.
- The available commands are self-describing — running the front door with no
  argument (or a help target) lists what you can do.
- The existing per-part commands (`code/hub`, `code/frontend`, `scripts/wireframes.sh`)
  still work on their own; the front door gathers them, it doesn't replace them.

## Open Questions

- What to bind beyond up / down / wireframes — candidates worth weighing: `install`
  (deps for both parts), `status` (what's running), `logs`, `build`, `type-check` /
  `check` (both parts), `real` vs `fake` agent mode for the hub, `clean`.
- The mechanism — a root `Makefile` that delegates to the sub-`make`s and
  `scripts/wireframes.sh`, vs. a script. (Makefile fits the existing convention and
  the user's instinct.)
- How "up" runs two long-lived processes and how "down" finds and stops them
  (backgrounding + pidfiles, a process group, or containers like the wireframes
  script already uses) — must stay host-independent and survive across shells.
- Whether wireframes (static, container-served) belong under the same up/down or stay
  a separate target, given they have a different lifecycle.
- Staying target-agnostic — no vendor specifics in the front door.

## Status

- Created: 2026-06-04
- Issues: #29 ✅ done (PR #31 merged), #30 (open — wireframes + status/logs)
