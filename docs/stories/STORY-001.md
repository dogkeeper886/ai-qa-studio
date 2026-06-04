# STORY-001: See the project's stories in the studio

## User Story

As a person using the studio,
I want to see the stories that exist in this project in the web GUI,
So that I can understand what's planned without opening raw markdown files.

## The Need

Stories live as markdown files in `docs/stories/` — the source of truth. Today the
only way to see them is to open the files directly. The studio is meant to be the
product face over that source of truth, so the first thing it should do is make the
existing stories visible in one place. This is the smallest slice that proves the core
idea: the dashboard reads the markdown and shows the project's state.

## Success Looks Like

- Opening the studio shows the stories that exist in a chosen repo's `docs/stories/`.
- Each story is identifiable (its ID and title) and its content is readable without
  leaving the GUI.
- When a story is added or changed in `docs/stories/`, what the studio shows reflects it.

> Scope note: STORY-004 generalized the target from *this* repo's `docs/stories/` to a
> **chosen repo** under `active/` (the hub serves `/api/repos` and repo-scoped stories).
> The studio shows the stories of the repo you open, not its own — delivered the same way.

## Open Questions

- ~~How stories are presented~~ — resolved: a list (ID + title) plus a full read view (`qa-md-viewer`).
- Whether story status belongs in this view or in a later story.
- ~~How the studio reads the files~~ — resolved: at runtime, fetched live from the hub (reflected on reload).

## Status

- Created: 2026-06-02
- Issues: #4 (delivered — wireframe #7; built view repo-scoped via STORY-004 #17/#18)
