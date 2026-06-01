---
name: auditing-artifacts
description: |
  Audits this repo's commands/, skills/, and CLAUDE.md on two axes — Format (structural
  correctness) and Purpose (does the artifact deliver its stated goal). Use when the
  user wants to audit, review, or sanity-check the project's commands, skills, or
  CLAUDE.md as a whole.
disable-model-invocation: true
---

# auditing-artifacts

Two-axis audit across the three artifact types in this repo:

- `commands/**/*.md` — slash command source files
- `skills/*/SKILL.md` — skill source files
- `CLAUDE.md` — project root config

This skill is the **top-level sweep**. For a deep, command-only audit, use `reviewing-commands` (8 quality dimensions, line-level issues).

## The Two Axes

| Axis | Question it answers |
|------|---------------------|
| **Format** | Is the artifact structurally valid and well-formed? |
| **Purpose** | Does the artifact deliver on its stated goal, without sprawl or redundancy? |

Both axes are scored per artifact: **Pass / Partial / Fail / N/A**.

## Progress Checklist

```
- [ ] Step 1: Determine scope
- [ ] Step 2: Enumerate target files
- [ ] Step 3: Audit Format axis
- [ ] Step 4: Audit Purpose axis
- [ ] Step 5: Cross-cutting checks (CLAUDE.md ↔ filesystem)
- [ ] Validate: every target scored on both axes
- [ ] Step 6: Generate report
- [ ] Step 7: Apply fixes (if --fix requested)
```

## Steps

### Step 1: Determine Scope

Parse user input:

| Input | Scope |
|-------|-------|
| (no args) | All three: `commands/`, `skills/`, `CLAUDE.md` |
| `commands` or `commands/<subfolder>` | Commands only (folder or subfolder) |
| `skills` or `skills/<name>` | Skills only (all or one) |
| `claude.md` | CLAUDE.md only |
| `--fix` | After report, apply fixes with user confirmation |

### Step 2: Enumerate Target Files

Use `Glob` for each in-scope target:

- Commands: `commands/**/*.md`
- Skills: `skills/*/SKILL.md`
- Root: `CLAUDE.md`

Announce the count before reading.

### Step 3: Audit Format Axis

Apply the checklist for each artifact type.

#### Commands (`commands/**/*.md`)

- [ ] File name matches `prefix-name.md` convention (lowercase, hyphenated)
- [ ] File lives in the correct subfolder for its prefix (e.g., `tl-*` in `commands/testlink/`)
- [ ] Has a top-level `# Heading` (command name / title)
- [ ] Under 500 lines (official Claude Code limit)
- [ ] Markdown is well-formed (no broken tables, unclosed code fences, dangling links)
- [ ] Cross-references to other commands use `/prefix-name` and the target exists
- [ ] No private identifiers leaked (real ticket IDs, page IDs, project names — see CLAUDE.md "Information Leak Check")

#### Skills (`skills/*/SKILL.md`)

- [ ] File is named exactly `SKILL.md`
- [ ] Folder name matches `name:` in frontmatter
- [ ] Folder name is lowercase-kebab-case
- [ ] Frontmatter is valid YAML with at least `name` and `description`
- [ ] `description` under 250 chars (truncated otherwise)
- [ ] Has a Progress Checklist or step sequence
- [ ] Under 500 lines
- [ ] Cross-references to commands (`/cmd-name`) resolve to existing files

#### CLAUDE.md

- [ ] Has `## Project Overview` and `## Architecture` (or equivalent)
- [ ] `## Skills` table is present (when the project ships skills)
- [ ] Directory Structure block reflects the actual `commands/` and `skills/` layout
- [ ] Skills table entries match `skills/*/` folders (no orphans, no missing)
- [ ] Command subfolders listed match `commands/*/` folders
- [ ] MCP dependencies section lists each MCP server referenced in commands

Score Format per artifact: **Pass** (all applicable checks satisfied), **Partial** (minor gaps), **Fail** (key checks missing).

### Step 4: Audit Purpose Axis

For each artifact, evaluate four sub-checks:

| Sub-check | What to look for |
|-----------|------------------|
| **P1: Goal clarity** | Is the purpose/description a single clear objective? Or vague ("manages X", "handles Y"), multi-purpose, or buried? |
| **P2: Description ↔ content alignment** | Do the actual steps/instructions deliver what the description promises? Flag mismatches (e.g., description says "audit", body only formats output). |
| **P3: Scope discipline** | Does every step trace back to the stated goal? Flag scope creep (steps that do something off-topic) and dead steps (instructions that produce no useful output). |
| **P4: Redundancy / necessity** | Does this artifact substantially duplicate another (>50% overlap with another command/skill)? Could it be merged or removed? |

For CLAUDE.md, P3/P4 translate to:
- P3: Does each section justify its presence, or is there stale/orphaned content?
- P4: Are there entries that reference removed commands/skills (orphans), or commands/skills missing from the table (gaps)?

Score Purpose per artifact: **Pass** (all four sub-checks satisfied), **Partial** (1 sub-check failing), **Fail** (2+ sub-checks failing).

### Step 5: Cross-Cutting Checks (CLAUDE.md ↔ Filesystem)

Run these even when scope is narrower than all-three, if CLAUDE.md is in scope or all three are in scope:

1. **Skills drift** — every row in CLAUDE.md's Skills table has a matching `skills/<name>/SKILL.md`, and vice versa.
2. **Command folder drift** — every subfolder listed in the Directory Structure block exists in `commands/`, and every actual subfolder appears in the block.
3. **Orphan references** — search CLAUDE.md for `/cmd-name` patterns; confirm each resolves to an existing command file.
4. **MCP references** — every MCP server name appearing in command bodies appears in CLAUDE.md's MCP Dependencies section.

### Validate

Confirm every in-scope target has both axes scored. Confirm cross-cutting checks ran when applicable.

### Step 6: Generate Report

Use this format:

```markdown
# Artifact Audit — <YYYY-MM-DD>

**Scope:** <commands | skills | CLAUDE.md | all>
**Targets audited:** <count>

## Scorecard

| Artifact | Format | Purpose | Critical | Major | Minor |
|----------|--------|---------|----------|-------|-------|
| commands/testlink/tl-create-case.md | ✓ | ~ | 0 | 1 | 2 |
| skills/planning-tests/SKILL.md | ~ | ✓ | 0 | 1 | 0 |
| CLAUDE.md | ✓ | ✓ | 0 | 0 | 1 |

Legend: ✓ Pass · ~ Partial · ✗ Fail · — N/A

## Cross-Cutting Findings

- <e.g., "CLAUDE.md Skills table lists `reviewing-commands` but folder is missing">
- <e.g., "`commands/testlink/tl-foo.md` references `/tl-bar` which does not exist">

## Issues by Severity

### Critical (must fix — artifact will fail or mislead)
| # | Artifact | Axis | Issue | Suggested Fix |
|---|----------|------|-------|---------------|

### Major (should fix — ambiguity or drift)
| # | Artifact | Axis | Issue | Suggested Fix |
|---|----------|------|-------|---------------|

### Minor (optional)
| # | Artifact | Axis | Issue | Suggested Fix |
|---|----------|------|-------|---------------|

## Overall: APPROVED / NEEDS REVISION
```

Severity rubric:

| Severity | Definition |
|----------|-----------|
| **Critical** | Format failure that breaks loading (invalid frontmatter, missing SKILL.md), or Purpose failure that means the artifact does not do what it claims |
| **Major** | Significant drift or ambiguity (description/content mismatch, orphan reference, scope creep) |
| **Minor** | Style, naming polish, redundant phrasing |

### Step 7: Apply Fixes (if `--fix` requested)

1. Present the full report first.
2. Wait for user confirmation per group (Critical → Major → Minor).
3. Apply fixes one artifact at a time, smallest blast radius first.
4. Never delete an artifact without explicit user approval — flag for removal in the report instead.
5. Re-score affected artifacts after fixes; confirm improvement.

## Expected Input

- `(no args)` → audit all three artifact types
- `commands` | `commands/<subfolder>` → commands only
- `skills` | `skills/<name>` → skills only
- `claude.md` → CLAUDE.md only
- Append `--fix` to any of the above to apply fixes after the report

## Relationship to `reviewing-commands`

| Skill | Scope | Depth |
|-------|-------|-------|
| `auditing-artifacts` (this) | commands + skills + CLAUDE.md | Two-axis sweep, cross-cutting checks |
| `reviewing-commands` | commands only | 8 quality dimensions, line-level issues |

Run this skill first for a project-wide health check. Drill into specific commands with `reviewing-commands` when this skill flags something at the command level.

## Next Step

After the report, common follow-ups:
- `reviewing-commands <path>` — deep audit on any command flagged here
- Fix orphan references in CLAUDE.md (most common Major finding)
- Re-run `auditing-artifacts` after fixes to confirm scorecard improvement
