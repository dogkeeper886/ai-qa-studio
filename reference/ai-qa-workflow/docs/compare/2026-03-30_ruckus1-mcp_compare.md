# Cross-Repo Comparison: ai-qa-workflow vs ruckus1-mcp

**Date:** 2026-03-30
**Local repo:** ai-qa-workflow
**Remote repo:** ruckus1-mcp

## Summary

- Components compared: 5
- Identical: 0
- Diverged: 3 (sync B→A: 2, backport A→B: 1)
- Local-only: 3 (compare, sync, command-review)
- Remote-only: 4 (ci-testcase, ci-run, add-tool, dev-story candidate)

## Shared Commands

### evolve.md (diverged — sync B→A)

ai-qa-workflow version has 10 meaningful improvements over ruckus1-mcp:
- Richer session summary extraction (3 signal types vs 1)
- Better Phase 4 scoping ("since the prior report date")
- Stricter New Commands gate ("3+ evidence points")
- Clearer verdict wording and evidence specificity
- Explicit remove/add for Patterns to Monitor list

**Action:** Reverse backport ai-qa-workflow improvements to ruckus1-mcp. No changes needed in ai-qa-workflow.

### session-summary.md (diverged — sync B→A)

ai-qa-workflow version has 14 meaningful improvements:
- More comprehensive privacy rules (6 checklist items vs 4)
- Inline anonymization reminders in output template
- Phase intro sentences and examples for better agent guidance
- mcp_categories (aggregation-friendly) vs mcp_tools_used (raw list)
- Workflow Trends dashboard section
- Self-documenting phase cross-references to /evolve

**Action:** Reverse backport to ruckus1-mcp. No changes needed in ai-qa-workflow.

### Dev flow: story-driven vs issue-driven (complementary)

| Capability | ruckus1-mcp (story-driven) | ai-qa-workflow (issue-driven) |
|---|---|---|
| Requirements capture | dev-story (structured story files) | Not present |
| Break into issues | dev-tasks (reads story) | dw-plan (freeform input, duplicate check, labels) |
| Implement | dev-impl (project-specific) | dw-implement (generic, failure handling) |
| PR creation | Not present | dw-create-pr |
| PR review | Not present | dw-review-pr |
| Merge & cleanup | Not present | dw-merge |

**Decision:** Complementary. Backport `dev-story` to ai-qa-workflow as `dw-story`. Drop `dev-tasks` and `dev-impl` (subsumed by dw-*).

## Remote-only (future phases)

| Component | Lines | Status |
|---|---|---|
| CI Test Framework (cicd/tests/) | ~1500 | Phase 2 — separate issue |
| MCP tool patterns (CLAUDE.md) | ~400 | Phase 3 — separate issue |
| add-tool.md | 305 | Phase 3 — separate issue |

## Local-only (reverse backport candidates)

| Component | Status |
|---|---|
| compare.md | Phase 4 — backport to ruckus1-mcp |
| sync.md | Phase 4 — backport to ruckus1-mcp |
| command-review.md | Phase 4 — backport to ruckus1-mcp |
| dw-* commands (5) | Phase 4 — evaluate for ruckus1-mcp |
