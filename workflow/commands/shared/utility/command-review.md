# Command Review — Quality Audit for Slash Commands

```
Review one or more slash command files for quality and consistency.

Arguments: {{input}}
  - (empty)           Review ALL commands in commands/
  - <path>            Review a specific command file
  - <folder>          Review all commands in a subfolder
  - --fix             Auto-fix issues after presenting the report (with user confirmation)

Examples:
  /command-review
  /command-review testlink/tl-create-case.md
  /command-review testlink
  /command-review --fix
```

## Purpose

Audit slash command files for quality, consistency, and alignment with official Claude Code documentation. Criteria are based on verified sources, not assumptions.

## Official Reference

Per [Claude Code docs](https://code.claude.com/docs/en/skills):
- **Minimal commands are valid** — single sentence, no frontmatter, no sections required
- **No prescribed section headings** — body is free-form markdown
- **Two content types** — "reference content" (conventions/knowledge) and "task content" (step-by-step actions)
- **500-line limit** — move reference material to separate files
- **Description field** — only recommended frontmatter field, truncated at 250 chars

## Review Profiles

| Scope | Profile | Depth |
|-------|---------|-------|
| Single file | **Deep** | All 6 dimensions, line-level issues |
| Subfolder | **Standard** | All 6 dimensions, file-level summary per command |
| All commands | **Overview** | Aggregate scores, cross-cutting issues |

---

## Agent Instructions

### Step 1: Determine Scope

```
1. Parse arguments:
   - No arguments → Overview profile, scan all commands/**/*.md
   - Path to file → Deep profile, audit that single file
   - Folder name → Standard profile, audit all *.md in that subfolder
2. Count target files and announce scope
```

### Step 2: Read Files

```
Deep profile:    Read the full target file
Standard profile: Read all files in the target subfolder
Overview profile: Read all files across all subfolders
```

### Step 3: Evaluate Quality Dimensions

Evaluate each command against **6 quality dimensions**. Score each: Pass / Partial / Fail.

**Important:** Apply dimensions proportionally to command type. A 7-line reference command is evaluated differently than a 120-line task command with MCP integration.

---

#### D1: Size & Structure

Check official limits and internal consistency.

**Checklist:**
- [ ] Under 500 lines (official limit — move reference material to supporting files if over)
- [ ] If frontmatter exists, description is under 250 characters (truncated otherwise)
- [ ] If frontmatter exists, name is lowercase letters/numbers/hyphens only, max 64 characters
- [ ] Content type is clear — either reference (conventions/knowledge) or task (step-by-step)
- [ ] For task commands: steps are numbered, not buried in prose
- [ ] No orphan content outside logical groupings

**Not checked:** Specific section headings — the official docs prescribe none.

---

#### D2: Clarity & Specificity

Instructions must be precise enough for an AI agent to execute without ambiguity. **Applies primarily to task commands.**

**Checklist:**
- [ ] Steps reference specific tool names, file paths, or field names where applicable
- [ ] Conditional logic is explicit ("IF type is Feature THEN..." not "handle accordingly")
- [ ] Vague verbs avoided: "handle", "process", "deal with", "manage", "address"
- [ ] Each step produces a clear, verifiable output
- [ ] MCP tool names are spelled out when the command calls external tools

**For reference commands:** Clarity means the conventions are specific enough to apply consistently. Vague guidance like "write clean code" is a fail.

---

#### D3: Decision Logic

Commands with conditional paths must document their decision trees explicitly.

**Checklist:**
- [ ] Every IF/ELSE branch is documented
- [ ] Decision criteria are specific and testable
- [ ] Fallback/default paths are defined

**When to flag:**
- Command has 2+ conditional paths but no decision tree
- Steps say "depending on..." without specifying conditions

**Skip for:** Simple commands with no branching logic.

---

#### D4: Error Handling

Commands that interact with external systems must handle failures.

**Checklist:**
- [ ] Common error scenarios listed with solutions
- [ ] Missing prerequisite handling defined
- [ ] Partial failure paths handled

**Applicability:**
- **Required** for: TestLink (`tl-*`), Confluence (`cf-*`), Jira (`jr-*`), GitHub (`gh-*`), browser automation
- **Skip** for: Pure documentation commands (`tw-*`, `pm-*`) and reference commands

---

#### D5: Consistency

Commands must follow the project's established patterns.

**Checklist:**
- [ ] File naming follows `prefix-name.md` convention
- [ ] References to other commands use `/prefix-name` format
- [ ] Ticket ID formats match project conventions (PROJ-NNNNN, FR-NNNN)
- [ ] HTML formatting for TestLink content references `/tl-format` (not inlined)
- [ ] Terminology consistent with CLAUDE.md and sibling commands

---

#### D6: Maintainability

Commands should be easy to update without causing drift.

**Checklist:**
- [ ] No hardcoded values that will drift (specific page IDs, user names, dates)
- [ ] No duplicated content that exists in another command (reference it instead)
- [ ] References to other commands/files are correct and the targets exist
- [ ] For commands sharing logic: the shared content lives in one place with references, not copy-pasted

**Key check:** Duplication detection. If two commands contain the same block of 5+ lines, flag it for consolidation.

---

### Step 4: Score and Classify

For each command, assign dimension scores:

| Score | Meaning |
|-------|---------|
| **Pass** | All applicable checklist items satisfied |
| **Partial** | Most items satisfied, minor gaps |
| **Fail** | Key items missing, impacts usability |
| **N/A** | Dimension does not apply to this command type |

Classify issues by severity:

| Severity | Definition | Action |
|----------|-----------|--------|
| **Critical** | Command will produce wrong output or fail silently | Must fix |
| **Major** | Command works but is ambiguous or inconsistent | Should fix |
| **Minor** | Style or nice-to-have improvement | Optional |

### Step 5: Cross-Cutting Analysis (Standard / Overview only)

For multi-file reviews, identify patterns:

1. **Duplication** — same content block repeated across commands
2. **Terminology drift** — same concept described differently
3. **Orphaned references** — commands referencing other commands that don't exist
4. **Size outliers** — commands approaching or exceeding 500 lines

### Step 6: Generate Report

---

## Output Format

### Deep Profile

```markdown
# Command Review: [command-name]

**File:** `commands/[path]`
**Lines:** XXX
**Type:** Reference / Task

## Dimension Scores

| Dimension | Score | Issues |
|-----------|-------|--------|
| D1: Size & Structure | Pass / Partial / Fail | X issues |
| D2: Clarity | Pass / Partial / Fail / N/A | X issues |
| D3: Decision Logic | Pass / Partial / Fail / N/A | X issues |
| D4: Error Handling | Pass / Partial / Fail / N/A | X issues |
| D5: Consistency | Pass / Partial / Fail | X issues |
| D6: Maintainability | Pass / Partial / Fail | X issues |

## Issues

| # | Severity | Dimension | Location | Issue | Suggested Fix |
|---|----------|-----------|----------|-------|---------------|

## Overall: APPROVED / NEEDS REVISION
```

### Standard Profile

```markdown
# Command Review: [folder]/ (X commands)

## Scorecard

| Command | D1 | D2 | D3 | D4 | D5 | D6 | Issues |
|---------|----|----|----|----|----|----|--------|
| cmd-a   | ✓  | ✓  | ~  | —  | ✓  | ✓  | 1 |

Legend: ✓ Pass, ~ Partial, ✗ Fail, — N/A

## Cross-Cutting Issues
[Patterns across commands]

## Per-Command Issues
[Issues grouped by command]
```

### Overview Profile

```markdown
# Command Review: All Commands (X total)

## Health Summary

| Folder | Commands | Critical | Major | Minor |
|--------|----------|----------|-------|-------|

## Cross-Cutting Issues
[Duplication, terminology drift, orphaned refs, size outliers]

## Top Issues
[Highest-impact items]
```
```
