# docs/stories/ — feature requests as goals

A **story** captures **one feature request as a goal**: what a user needs and why.
It is **not a spec.** It does not pin down files, APIs, or implementation steps —
those are decided later, and they change.

## Why there is no spec here

Working out *how* takes several steps — web search, a proof of concept, clarifying
questions, and the normal back-and-forth of building (integration, unit tests, fixes).
That work **evolves**, so its home is the **GitHub issue**, which keeps the full
history: source, rationale, tasks, findings, failures, and fixes.

So the split is:

- **Story** (`docs/stories/STORY-XXX.md`) — the need. Stable. A goal.
- **GitHub issue** — the evolving work and its history. The single source of truth for *how*.

## Flow

```
/dw-story         → writes the story (the need)           → docs/stories/STORY-XXX.md
/dw-review-story  → checks completeness, keeps it a goal  → revises in place
/dw-tasks         → opens GitHub issue(s) from the story  → spec + history live on the issue
/dw-review-tasks  → checks the issues cover the story     → fixes them in place
/dw-implement     → branch, build, the back-and-forth     → recorded on the issue
```

## How to write one

- State the user's need and the benefit; leave the *how* open.
- Don't list affected files, dependencies, or implementation steps — that is issue work.
