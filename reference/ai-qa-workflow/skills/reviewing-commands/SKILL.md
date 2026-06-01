---
name: reviewing-commands
description: |
  Audits slash command files for quality, consistency, and industry best practices.
  Use when a QA engineer wants to review commands, audit command quality, check
  command consistency, or validate commands after updates.
disable-model-invocation: true
---

# reviewing-commands

Audits slash command files against 8 quality dimensions and industry best practices (IEEE 829, ISTQB, ISO/IEC 29119).

## Progress Checklist

Copy and track your progress:

```
- [ ] Step 1: Determine scope and profile
- [ ] Step 2: Read target command files
- [ ] Step 3: Evaluate 8 quality dimensions
- [ ] Step 4: Score and classify issues
- [ ] Validate: Dimension scores + issue counts + recommendation
- [ ] Step 5: Apply fixes (if --fix requested)
- [ ] Validate: All fixes applied, re-score confirms improvement
```

## Steps

### Step 1: Determine Scope and Profile

Parse user input to determine review scope:

- **Single file** → Deep profile (all 8 dimensions, line-level issues)
- **Subfolder name** → Standard profile (per-command scorecard + cross-cutting patterns)
- **No arguments** → Overview profile (aggregate heatmap across all commands)

### Step 2: Read Command Files

Run `/command-review` with the detected scope. The command file at `.claude/commands/utility/command-review.md` contains the full review methodology including:

- 8 quality dimensions (D1-D8) with checklists
- Scoring criteria (Pass / Partial / Fail)
- Issue severity levels (Critical / Major / Minor)
- Output templates for each profile

### Step 3: Evaluate Quality Dimensions

Apply all 8 dimensions from `/command-review`:

| # | Dimension | What It Checks |
|---|-----------|----------------|
| D1 | Structure & Sections | Required sections present and in order |
| D2 | Clarity & Specificity | No vague verbs, exact paths/tools |
| D3 | Decision Logic | All IF/ELSE branches explicit |
| D4 | Examples & Templates | Concrete input→output examples |
| D5 | Error Handling | Required for integration commands |
| D6 | Project Conventions | Naming, terminology, HTML rules |
| D7 | Scannability | Numbered steps, tables, separators |
| D8 | Maintainability | No hardcoded values, no duplication |

### Step 4: Score and Classify

Produce the review report matching the output format in `/command-review`.

### Validate

Report:
- Dimension scores for each reviewed command
- Total issue count by severity (Critical / Major / Minor)
- Overall recommendation: **APPROVED** or **NEEDS REVISION**

### Step 5: Apply Fixes (if requested)

If the user requests `--fix` or asks to apply fixes:

1. Present the full report first
2. Wait for user confirmation
3. Apply fixes one at a time, starting with Critical, then Major
4. Re-read the file after all fixes to confirm no regressions

### Validate

Report:
- Number of fixes applied
- Updated dimension scores (confirm improvement)

## Expected Input

- Path to a command file, folder name, or no arguments
- Examples: `/command-review test-workflow/tw-case-review.md`, `/command-review testlink`, `/command-review`

## Next Step

After reviewing commands, consider running `/evolve` to check if git history reveals additional improvement patterns.
