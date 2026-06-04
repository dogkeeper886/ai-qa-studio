# STORY-005: One committed workflow surface — grouped, command-first, no sync

## User Story

As a person maintaining the studio's workflow (skills + commands),
I want the units to live in **one committed place the backend loads directly** —
grouped by purpose, command-first, every producer paired with a review,
So that there is nothing to sync, the agent always finds the right unit, and nothing
ships unreviewed.

## The Need

This ports the principles settled in `r1-test-cases` STORY-001 (ADR-0002), and removes
the indirection that was costing us a maintenance chore.

**Command-first, skills flat — r1's lesson, which holds for us too.** Claude Code
discovers skills only one level deep (`.claude/skills/<name>/SKILL.md`); a foldered skill
is invisible. Commands, by contrast, fold into purpose folders
(`.claude/commands/<group>/<name>.md` → `/<group>:<name>`) and stay discoverable. So
**grouping lives on commands; commands are the default home**, and skills are reserved —
flat — for the few units that genuinely need `references/` progressive disclosure or true
auto-invocation.

**One committed surface, not a generated one.** Until now `workflow/` was the committed
source of truth and `.claude/` was gitignored and *rebuilt* from it. That split existed
only to keep a single committed copy while `.claude/` stayed local — but it created the
real pain: every change to `workflow/` needs a rebuild or the agent runs stale, and the
two can silently drift. The backend runs at the **studio root** and loads `.claude/`
directly, so the split earns nothing. Commit `.claude/` itself as the single source of
truth and stop generating it: **the thing you edit is the thing that runs** — no build,
no drift, exactly one copy.

**Pairing carries over unchanged.** Every producer (`create-/sync-/publish-/draft-` and
their kin) is paired with a review that checks the result, wired in the same change and
enforced by an audit — a standing rule in CLAUDE.md, not something to remember per task.

## Success Looks Like

- The studio's skills and commands live in **one committed place the backend loads with
  no build or sync step** — editing a unit *is* editing the thing that runs.
- Units are **grouped by purpose**; commands are the default home (grouped, discoverable),
  skills kept flat for the few that need `references/` or auto-invocation; no name
  collisions.
- **Every producer has a named review partner**, stated where it's enforced (CLAUDE.md),
  and an audit can name any producer that lacks one.
- There is **exactly one committed copy** of each unit — no second location that can drift.

## Open Questions

*(The "how" — worked out on the issues.)*

- **`workflow/` disposition.** Move its content into `.claude/` and **remove `workflow/`**
  (recommended — guarantees one copy), updating the docs that describe the old convention
  (CLAUDE.md run-surface section, README, `.gitignore`). Keeping `workflow/` as a second
  committed "store" would re-introduce the drift this story removes.
- **Gitignore.** Un-ignore `.claude/commands` + `.claude/skills`; keep
  `.claude/settings.local.json` (and any other genuinely local file) ignored. Confirm
  nothing else under `.claude/` must stay local.
- **The structure pass.** Which units are well-placed already, and which need moving or
  rewriting to fit *grouped + command-first*? Which skills genuinely stay skills (need
  `references/` or auto-invocation) vs. fold into a command family?
- **Pairing coverage.** The exact producer→review map, and where the coverage check lives —
  extend the existing `reviewing-artifacts` skill (our analogue of r1's `auditing-artifacts`)
  with a pairing pass, or a separate check?
- **#21** folds in as one of this story's issues rather than running in parallel.

## Out of Scope (separate, future story)

- How per-repo work under `active/<repo>` loads its context — a **partial checkout** (just
  `docs/stories` + the test folder) vs. a full clone, and the effect that has on test
  execution. The backend runs at the studio root and handles the studio's own repo; the
  `active/` design is deliberately deferred and will be worked out on its own.

## Status

- Created: 2026-06-04
- Issues: #22 (commit `.claude/`, remove the split), #23 (restructure: grouped +
  command-first), #21 (producer→review pairing: rule + audit) — folded in from the
  original prefer-commands port
- Follow-ups (from #21's coverage pass): #24 (TestLink sync review — `tl-review-sync`),
  #25 (`reviewing-phrasing` — the missing phrasing half, pairs the text deliverables).
  Low-stakes scaffolds (`pm-init`, `tw-diagrams`, `tw-baseline-trace`, `session-summary`)
  are explicitly **exempt** (no outward deliverable to review).
