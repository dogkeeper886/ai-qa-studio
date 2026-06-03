# STORY-004: Work across repos in the studio

## User Story

As a person using the studio,
I want to pick a repo from a list, open it to see its stories, and talk to the agent
in that repo's context,
So that the studio is a workbench over my QA projects — not just a viewer of its own.

## The Need

Stories 1–3 proved the loop against the studio's *own* repo: read the markdown source
of truth, render the design framework, and chat with the agent over the hub. That
proof phase is done. But the product the Vision describes is a **face over QA work
across projects**, and today everything is hardwired to the studio's own folder — the
hub serves one workspace, the stories view shows one project, the agent runs in one
place.

The real product starts the moment a user can point the studio at the project they
actually care about: see the repos available to work in, open one, get the
see-its-stories experience there, and have the assistant operate inside *that* repo.
This is the step that turns the proven loop into a usable workbench.

## Success Looks Like

- Opening the studio shows the repos/projects available to work in.
- Opening a repo shows that repo's stories — the STORY-001 experience, now scoped to
  the chosen repo.
- The assistant works in the open repo's context: what it reads and what it produces
  belongs to that repo.
- Switching repos changes what's shown and where the agent works, without restarting
  the studio.

## Open Questions

The *how* — worked out on the issue (research / PoC / decisions):

- **What a "repo" is and how it's chosen** — local folders the user points at, cloned
  GitHub repos, or the fixed sibling set from the Vision doc. Shapes everything below.
- How repos are **discovered, added, and remembered** across studio restarts.
- How the **hub serves a chosen repo** rather than its own — the foundation (STORY-003)
  served a single hardwired workspace, so this is the new capability layered on it.
- How this composes with the proof-phase issues: the single-repo **stories view (#4)**
  is superseded/folded here; the **chat build (#13)** continues and gains repo-context.
- Whether **repo status/overview** (beyond the stories list) belongs on the repo page
  or a later story.
- One **active repo** at a time vs. several open at once.

## Status

- Created: 2026-06-03
- Builds on: STORY-001 (stories view), STORY-002 (agent chat), STORY-003 (foundation) —
  the proof-of-loop phase this stands on.
- Issues: #16 (spike: agent-in-repo + studio skills), #17 (hub: serve a chosen repo),
  #18 (frontend: repo list + repo page — supersedes #4), #19 (chat scoped to active repo
  — continues #13)
- PR: #20 open — #17 + #18 (+ markdown rendering and the Projects-first nav), awaiting
  review. #16 (spike) and #19 (chat) not included.
