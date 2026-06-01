# Enhancement Study: Issue-Driven AI Agent Workflow

**Date**: 2026-03-10
**Source**: LinkedIn post "How I Made an AI Code Agent Follow a Real Development Process"
**Projects Studied**: ai-qa-workflow (this repo), ollama37 (target), everything-claude-code (reference)

## Context

This study analyzes how ai-qa-workflow can be enhanced based on patterns from ollama37 and everything-claude-code. The LinkedIn post advocates two key ideas: (1) break work into tracked issues before writing code, and (2) organize the agent's memory in layers.

## Current State: ai-qa-workflow

- 58 slash commands across 7 categories (confluence, github, jira, project, testlink, test-workflow, utility)
- 9 agent skills as thin routers with progress checklists
- 6-phase QA lifecycle: Discover → Plan → Design → Manage → Automate → Execute
- External system integrations: Jira, Confluence, TestLink, Playwright, GitHub
- Command-as-Documentation pattern
- Detect-and-route orchestration (feature/bugfix/enhancement)

## Patterns from ollama37

- `/plan` and `/implement` skills for GitHub Issue-driven development
- 7-step implementation workflow: Understand → Start → Implement → Failure Protocol → Success → Partial Fix → Post-Merge
- GitHub Issues as persistent memory across sessions
- Labels (type, priority, component) and cross-references (`Depends on #N`, `Fixes #N`)
- 12 skills listed in CLAUDE.md with trigger conditions
- 3-layer memory: CLAUDE.md (governance) → Skills (when/what) → Commands (how)
- Failure protocol: comment on issue, apply `status:blocked` label
- CI integration via `/ci` skill

## Patterns from everything-claude-code

- 47 slash commands, 80+ skills, 13-16 specialized subagents
- `/plan` requires explicit user approval before proceeding
- `/verify` with 6-step quality gates (Build → Types → Lint → Tests → Logs → Git Status)
- `/tdd` enforcing RED-GREEN-REFACTOR cycle
- Instinct system for cross-session learning with confidence scoring
- Orchestration pattern chaining agents through handoff documents
- All work stays agent-internal (optimizes for speed within agent)

## Identified Enhancement Areas

### Item 1: GitHub Change Tracking for QA Artifacts (IMPLEMENTED)

**Reframed**: This is not about adding dev workflow. It's about **requirements provenance** — tracking why test plans and test cases change, where requests come from, and what work remains.

The insight from ollama37: GitHub Issues survive between sessions. When the agent forgets, the issue history preserves what was attempted, what failed, and what was decided. This is a QA input, not a dev artifact.

**What was built:**
- `commands/github/gh-init.md` — Initialize milestone + labels for a Jira ticket
- `commands/github/gh-track.md` — Create tracking issue with checklist and provenance
- `commands/github/gh-status.md` — Show open work and pending tasks (session recovery)
- `commands/github/gh-close.md` — Close issue with completion summary
- `skills/tracking-changes/SKILL.md` — Orchestrates when to track alongside existing skills

**How it fits the QA flow:**
```
Jira (PROJ-12345)          ← WHY we're testing (requirement source)
  │
GitHub Milestone           ← Tracks all QA work for this ticket
  ├── Issue: test plan     ← What was created, checklist of sections
  ├── Issue: test cases    ← What was designed, scenario list
  ├── Issue: review        ← Feedback tasks with provenance
  ├── Issue: sync          ← TestLink sync record
  └── PRs with diffs       ← Exactly what changed in each file
  │
Test Artifacts             ← test_plan/, test_cases/ files with revision history
```

### Item 2: CLAUDE.md Skill Trigger Table (IMPLEMENTED)

Added a `## Skills` section to CLAUDE.md with a trigger table listing all 9 skills and their trigger conditions. The agent reads this table at session start to decide which skill to invoke.

No rewrite was needed — only a new section added.

### Item 3: Failure Protocol in Skills (PENDING — needs further discussion)

Add structured failure handling to skills: comment on tracking issue, apply labels, document partial progress.

**Note**: With GitHub tracking now in place, this becomes more feasible. The `/gh-track` command already supports documenting blocked tasks. The question is whether to formalize a failure protocol into each skill's checklist (e.g., "if step 3 fails, run `/gh-track` with failure details").

### Item 4: CI/CD Integration (PENDING — needs further discussion)

Add commands for triggering and monitoring CI pipelines.

**Note**: CI is typically a dev concern. For QA, the relevant integration might be triggering test suites and collecting results rather than build pipelines. Need to scope this to QA-specific CI needs (e.g., automated test execution reporting).

### Item 5: Revision History Enhancement (PENDING — needs further discussion)

Enhance `06_Revision_History.md` in test plans and change logs in test cases with:
- **Source** column (where the change came from)
- **Rationale** section (why, not just what)
- **Task checklist** per revision (what's done, what's open)
- **Details section** below the summary table for full context

This pairs with GitHub tracking: the revision history references GitHub issue numbers, while the issues contain the full discussion and diffs.

## Summary

| Item | Enhancement | Status | Fit with QA Focus |
|------|------------|--------|-------------------|
| 1 | GitHub Change Tracking | IMPLEMENTED | High — requirements provenance |
| 2 | CLAUDE.md Skill Trigger Table | IMPLEMENTED | High — project infrastructure |
| 3 | Failure Protocol | PENDING | Medium — needs QA scoping |
| 4 | CI/CD Integration | PENDING | Medium — needs QA scoping |
| 5 | Revision History Enhancement | PENDING | High — pairs with GitHub tracking |
