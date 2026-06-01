# Trace and Evolve: The Continuous Improvement Loop

This document explains how GitHub issues, session summaries, and the `/evolve` command form a closed-loop system for tracking QA work and continuously improving the workflow.

## Overview

The trace-and-evolve loop connects three concerns:

1. **Track** — GitHub issues record what QA work was done and why
2. **Observe** — Session summaries capture friction points and patterns
3. **Improve** — `/evolve` analyzes all evidence and proposes actionable changes

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    TRACE AND EVOLVE LOOP                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌──────────────┐         ┌──────────────┐         ┌──────────────┐   │
│   │   TRACK      │         │   OBSERVE    │         │   IMPROVE    │   │
│   │              │         │              │         │              │   │
│   │  GitHub      │────────▶│  Session     │────────▶│   /evolve    │   │
│   │  Issues      │         │  Summaries   │         │              │   │
│   │              │         │              │         │              │   │
│   │  /gh-init    │         │  /session-   │         │  Analyze     │   │
│   │  /gh-track   │         │   summary    │         │  Propose     │   │
│   │  /gh-status  │         │              │         │  Apply       │   │
│   │  /gh-close   │         │  patterns.md │         │              │   │
│   └──────┬───────┘         └──────────────┘         └──────┬───────┘   │
│          │                                                  │           │
│          │              ┌──────────────┐                    │           │
│          │              │   EXECUTE    │                    │           │
│          └─────────────▶│              │◀───────────────────┘           │
│                         │  QA Work     │                                │
│                         │  (skills &   │                                │
│                         │   commands)  │                                │
│                         └──────────────┘                                │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## The Three Layers

### Layer 1: Track — GitHub Issue Lifecycle

GitHub issues provide the traceability layer. Every QA activity (planning, designing, reviewing, syncing, executing) is recorded as an issue with a checklist under a milestone.

```
/gh-init PROJ-12345
    │
    │  Creates milestone + labels (one-time setup)
    │
    ▼
/gh-track "Create test plan for PROJ-12345"
    │
    │  Creates issue with:
    │  • Source (Jira ticket, review, PR)
    │  • Rationale (why this work matters)
    │  • Tasks (checkable items)
    │  • References (related issues, docs)
    │
    ▼
┌─────────────────────────────────────────┐
│  Issue #8: [QA] Create test plan        │
│  Labels: qa:plan, priority:high         │
│  Milestone: PROJ-12345 — USM            │
│                                         │
│  - [x] Detect ticket type               │
│  - [x] Write test plan sections 01-06   │
│  - [ ] Review coverage matrix           │
│  - [ ] Publish to Confluence            │
└─────────────────────────────────────────┘
    │
    │  Work progresses, checkboxes update
    │
    ▼
/gh-status PROJ-12345
    │
    │  Shows open issues, pending tasks,
    │  and suggested next action
    │
    ▼
/gh-close 8
    │
    │  Adds summary comment, closes issue
    │  (prefer closing via PR "Fixes #8")
    │
    ▼
  Done — full audit trail preserved
```

**Issue labels** classify the type of QA work:

| Label | Activity |
|-------|----------|
| `qa:plan` | Test plan creation or update |
| `qa:case` | Test case creation or update |
| `qa:review` | Review feedback or change request |
| `qa:sync` | TestLink synchronization |
| `qa:execute` | Test execution |

### Layer 2: Observe — Session Summaries

Session summaries capture what happened during each working session without exposing sensitive data.

```
/session-summary
    │
    ├─► Collects: goal, commands used, artifacts produced,
    │             friction points, workflow pattern, outcome
    │
    ├─► Privacy check: strips ticket IDs, credentials,
    │                   hostnames, personal data
    │
    ├─► Saves to: docs/session_summaries/YYYY-MM-DD_HHMM_summary.md
    │
    └─► Updates:  docs/session_summaries/patterns.md
                  (aggregates friction points, improvement candidates)
```

The `patterns.md` file acts as a bridge between session-level observations and project-level analysis:

| Section | What It Captures | Consumed By |
|---------|-----------------|-------------|
| Workflow Distribution | Which phases are used most | `/evolve` Phase 1 |
| Recurring Friction Points | Problems seen 2+ times | `/evolve` Phase 2 (3+ = High confidence) |
| Improvement Candidates | Suggested fixes from sessions | `/evolve` Phase 5 |

### Layer 3: Improve — `/evolve` Analysis

`/evolve` is the analytical engine. It reads GitHub issues, git history, and session summaries, then proposes evidence-based improvements.

```
/evolve
    │
    ├─► Phase 0: Read prior evolve reports (baseline)
    │
    ├─► Phase 1: Data Collection
    │   ├── GitHub issues (gh issue list)
    │   ├── Git commits (git log)
    │   ├── File change patterns (git log --name-only)
    │   └── Session summaries (patterns.md)
    │
    ├─► Phase 2: Pattern Detection
    │   ├── Workflow Gaps — missing automation
    │   ├── Friction Points — recurring fixes/reverts
    │   ├── Usage Patterns — co-changed files, churn
    │   └── Knowledge Decay — stale docs
    │
    ├─► Phase 3: Generate Insights (Low / Medium / High confidence)
    │
    ├─► Phase 4: Evaluate Prior Actions (did previous fixes work?)
    │
    ├─► Phase 5: Propose Actions
    │   ├── CLAUDE.md updates
    │   ├── New or updated commands
    │   ├── Skill improvements
    │   └── Memory updates
    │
    ├─► Phase 6: Output Report → docs/evolve/YYYY-MM-DD_evolve_report.md
    │
    └─► Phase 7: Apply (with user confirmation)
```

## How the Loop Closes

The three layers feed into each other, creating a continuous improvement cycle:

```
                    ┌──────────────────────────────────┐
                    │         QA WORK SESSION           │
                    │                                    │
                    │  /receiving-tickets                │
                    │  /planning-tests                   │
                    │  /designing-cases     ◄────────────┼─── Improved commands
                    │  /syncing-testlink                 │    and workflows
                    │  /executing-tests                  │
                    └──────────┬───────────────────┬────┘
                               │                   │
                    ┌──────────▼──────┐  ┌────────▼────────┐
                    │  /gh-track      │  │ /session-summary │
                    │                 │  │                  │
                    │  What was done  │  │  What was hard   │
                    │  Why it matters │  │  What was slow   │
                    │  What remains   │  │  What worked     │
                    └──────────┬──────┘  └────────┬────────┘
                               │                   │
                    ┌──────────▼──────┐  ┌────────▼────────┐
                    │  GitHub Issues  │  │  patterns.md     │
                    │  (milestones,   │  │  (friction,      │
                    │   labels, PRs)  │  │   candidates)    │
                    └──────────┬──────┘  └────────┬────────┘
                               │                   │
                               └─────────┬─────────┘
                                         │
                               ┌─────────▼─────────┐
                               │     /evolve        │
                               │                    │
                               │  Analyze evidence  │
                               │  Detect patterns   │
                               │  Propose actions   │
                               │  Track outcomes    │
                               └─────────┬─────────┘
                                         │
                               ┌─────────▼─────────┐
                               │  Applied Changes   │
                               │                    │
                               │  • CLAUDE.md rules │
                               │  • New commands    │
                               │  • Updated skills  │
                               │  • Better docs     │
                               └─────────┬─────────┘
                                         │
                                         └──────────────────► Next session
```

**Cycle frequency:**
- `/gh-track` and `/gh-close` — every session (per activity)
- `/session-summary` — end of each session
- `/evolve` — periodically (e.g., weekly or after 5+ sessions)

## Data Flow Summary

| Source | Data | Destination | Purpose |
|--------|------|-------------|---------|
| QA work | Artifacts created/modified | `/gh-track` | Traceability |
| `/gh-track` | Issues with checklists | GitHub milestones | Audit trail |
| `/gh-status` | Open tasks, progress | Agent context | Session recovery |
| QA work | Friction, patterns | `/session-summary` | Observation |
| `/session-summary` | Aggregated patterns | `patterns.md` | Pattern storage |
| GitHub issues | Issue history (state, labels, comments) | `/evolve` Phase 1 | Evidence |
| Git log | Commit messages, file changes | `/evolve` Phase 1 | Evidence |
| `patterns.md` | Friction points, candidates | `/evolve` Phase 1 | Evidence |
| `/evolve` | Proposed actions | CLAUDE.md, commands, skills | Improvement |
| `/evolve` | Report | `docs/evolve/` | Baseline for next run |

## Getting Started

### First time: Set up tracking for a project

```
/gh-init PROJ-12345                          # Create milestone + labels
/gh-track "Create test plan for PROJ-12345"  # Track first activity
```

### During work: Track and observe

```
# After completing a skill or command
/gh-close 8                                  # Close completed issue
/gh-track "Design test cases for PROJ-12345" # Track next activity

# At end of session
/session-summary                             # Record session patterns
```

### Periodically: Analyze and improve

```
/evolve                        # Full analysis (issues + commits, 90 days)
/evolve --since 30d            # Shorter window
/session-summary review        # Review accumulated patterns
```

## Related Commands

| Command | Purpose |
|---------|---------|
| `/gh-init` | Create GitHub milestone and labels for a project |
| `/gh-track` | Create tracking issue with checklist |
| `/gh-status` | Show open issues and pending tasks |
| `/gh-close` | Close issue with completion summary |
| `/session-summary` | Record privacy-safe session summary |
| `/evolve` | Analyze history and propose improvements |
