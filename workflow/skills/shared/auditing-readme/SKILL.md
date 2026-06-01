---
name: auditing-readme
description: |
  Audits the project README.md for typography (visual grouping via space, line
  breaks, font weight) and phrasing (human voice, not technical jargon, doesn't
  read like machine output). Use when README has been edited, or before
  publishing changes to ensure the user-facing intro stays approachable.
disable-model-invocation: true
---

# auditing-readme

A README is the first thing a visitor sees on GitHub. Unlike command files (internal, technical) or skill files (agent-facing), the README is read by humans deciding whether to use the project. This skill audits it on the two axes that matter for that decision.

| Axis | Question |
|------|----------|
| **Typography** | Does visual structure use space, line breaks, and font weight to group related ideas and separate distinct ones? |
| **Phrasing** | Does the prose read like a person wrote it for another person — direct, concrete, free of jargon dumps? |
| **Other reader friction** | Anything outside the two axes that would confuse, mislead, or put off a new reader — open observation. |

Both axes scored per section: **Pass / Partial / Fail**. The third bucket is open-ended — flag whatever you see.

**Important: the checklists in Step 2 and Step 3 are a *floor*, not a *ceiling*.** They name the failure modes that come up most often. If you notice an issue that hurts readability but doesn't match a checklist item, flag it anyway under the relevant axis (or Other reader friction). The goal is the reader's experience, not the checklist's completeness.

## Progress Checklist

```
- [ ] Step 1: Map README sections (H2 + H3)
- [ ] Step 2: Audit Typography per section
- [ ] Step 3: Audit Phrasing per section
- [ ] Step 4: Scan for Other reader friction (open observation)
- [ ] Validate: every section scored on both axes; open issues captured
- [ ] Step 5: Generate report with line numbers + concrete fixes
- [ ] Step 6: Apply fixes (if --fix requested)
```

## Steps

### Step 1: Map Sections

Read `README.md`. Index every `##` and `###` heading with line range and the block types it contains (paragraph / list / table / code / blockquote). The resulting map is what you score in Steps 2-3.

### Step 2: Typography Audit

The visual job of a README is to let a skimming reader find their answer without reading every word. Bad typography forces linear reading. The principles below come from `skills/reviewing-typography/references/typography-principles.md` (proximity / hierarchy / emphasis) — adapted to GitHub-rendered markdown.

#### Proximity — space tells the reader what goes together

- [ ] Blank line *before and after* every heading, list, table, and code fence
- [ ] Related items sit close (one blank line, not two); unrelated items separated more clearly (heading or horizontal rule)
- [ ] Paragraphs break at conceptual seams — no wall of text that mixes three ideas
- [ ] Lists are wrapped or kept short — bullets longer than ~150 chars in source usually mean the bullet is doing the job of a paragraph and should be one

#### Hierarchy — heading levels mirror conceptual nesting

- [ ] `#` (H1) appears exactly once (the project title)
- [ ] `##` for top-level sections, `###` for subsections — no skipping levels (no `##` followed directly by `####`)
- [ ] Heading depth matches conceptual depth — "Installation" is a sub-step under "Quick Start", not a sibling
- [ ] Section ordering follows reader journey: what the project is → why care → how to use → reference details, in that order

#### Emphasis — bold / italic / code mean specific things

- [ ] `**bold**` reserved for genuine emphasis (the one critical word in a sentence). Not for every command name, not for decorative shouting
- [ ] `*italic*` for secondary emphasis, term-on-first-mention, or work titles. Sparingly
- [ ] Inline `code` for actual code, paths, command names, file names. Not for arbitrary highlighting

#### Block choice — match the form to the content

- [ ] Tables for actual tabular data (parallel rows × columns). Not for two-column "label: value" pairs that should be a definition list or paragraph
- [ ] Code blocks for code, command output, or file contents only. Mermaid / ASCII diagrams are fine; decorative ASCII art is not
- [ ] Blockquotes for actual quotes or callouts (notes, warnings). Not as a styling trick

Score Typography per section.

### Step 3: Phrasing Audit

The README is public-facing. The reader is a developer evaluating the project, not an agent executing instructions. Tone matters.

#### Section names — describe the destination, not the mechanism

- [ ] Section title tells the reader what they get there ("Quick Start", "How It Works", "Available Commands") — not internal phases ("Phase 1: Module Bootstrap")
- [ ] Heading uses Title Case or sentence case consistently — not `snake_case`, `kebab-case`, or `CONSTANT_CASE`
- [ ] No undefined acronyms in headings (MCP is OK once defined; lesser-known acronyms aren't)

#### Voice — direct and human

- [ ] Active voice over passive ("Run `/jr-trace` to fetch the ticket" ✓ / "The ticket is fetched by `/jr-trace`" ✗)
- [ ] Direct address ("you" or imperative) over impersonal ("the user shall...")
- [ ] No corporate-marketing voice ("leverages cutting-edge AI", "revolutionizes workflows" ✗)
- [ ] No robotic voice ("the system processes requests", "the module is initialized" ✗)

#### Reads-like-machine-code red flags

- [ ] No `MODULE.SUBMODULE.METHOD_NAME` style identifiers used as prose subjects
- [ ] No bare path dumps (`/foo/bar/baz`) without context
- [ ] No tables of internal enum values pretending to be documentation
- [ ] No copy-pasted CLI `--help` output where prose would explain better
- [ ] No verbatim YAML/JSON config snippets where a sentence + one example suffices

#### Audience fit — GitHub README, mixed-expertise readers

- [ ] Opening sentence of each section states value within ~20 words
- [ ] Concrete examples over abstract claims (show `gh issue create --label feature` rather than "supports labeled issue creation")
- [ ] Jargon introduced with a one-line definition on first use
- [ ] No assumed prior knowledge of internal commands, MCP servers, or skill names beyond what's already been introduced in the README

Score Phrasing per section.

### Step 4: Other Reader Friction (open observation)

Read each section as a first-time visitor evaluating the project. Note anything that would slow them down, mislead them, or make them close the tab — even when it doesn't match a Typography or Phrasing checklist item. Common examples (non-exhaustive):

- **Stale or wrong content** — commands that no longer exist, paths that have moved, version numbers that are out of date
- **Broken or unhelpful links** — 404s, links labeled "click here", links to internal-only docs
- **Buried lede** — the project's purpose or main hook arrives too late
- **Missing prerequisites** — examples assume tools, accounts, or environment the reader doesn't have, with no upfront mention
- **Inconsistent tone or terminology** — same concept named two different ways across sections; voice flips between casual and formal
- **Examples that don't actually run** — copy-pasted commands with placeholders that aren't marked as such, or syntax that's subtly wrong
- **Unclear next step** — section ends without telling the reader what to do or read next
- **Promise without delivery** — claims a feature ("ready in 5 minutes") that the rest of the doc doesn't actually deliver
- **Accessibility gaps** — image without alt text, color-only meaning, link text that's not descriptive out of context
- **Anything else** — trust your reader instinct. If you'd be confused, frustrated, or unconvinced, write it down.

For each issue, capture: section + line, what's wrong, and the smallest concrete fix.

### Validate

Confirm every section has both axes scored.

### Step 5: Generate Report

```markdown
# README Audit — <YYYY-MM-DD>

**File:** `README.md`
**Sections audited:** <count>

## Scorecard

| Section | Lines | Typography | Phrasing | Issues |
|---------|-------|------------|----------|--------|
| Project Goal | 5-16 | ✓ | ✓ | 0 |
| Quick Start | 16-47 | ~ | ✓ | 1 |
| ... | ... | ... | ... | ... |

Legend: ✓ Pass · ~ Partial · ✗ Fail

## Issues by Severity

### Major (a reader on first encounter would stumble, get lost, or be put off)

| # | Section:Line | Axis | Issue | Suggested Fix |
|---|--------------|------|-------|---------------|

### Minor (polish)

| # | Section:Line | Axis | Issue | Suggested Fix |
|---|--------------|------|-------|---------------|

Axis can be Typography, Phrasing, or Other (open observation).

## Structural Recommendations (Medium / Large scope)

For each recommendation that touches structure or adds content (section split / merge / reorder / rename / new section / substantial new prose), present the tradeoff explicitly:

| # | Scope | Recommendation | Pros | Cons | Decision |
|---|-------|---------------|------|------|----------|
| 1 | Medium | Split "Quick Start" into "Installation" + "First Use" | Each step gets its own scannable section; lets new readers stop after install if that's all they need | One extra heading in the ToC; small risk of duplication if both need the same prerequisites | Pending user |
| 2 | Large | Move "Project Goal" above "Quick Start" | New readers see the value prop before the how-to; matches typical GitHub README convention | Loses the "show, don't tell" effect of leading with `Quick Start`; changes the URL anchor `#project-goal` would still exist but the page order ranking in GitHub previews changes | Pending user |

Rules:
- Pros and Cons are **specific and concrete**, not generic ("improves readability" is not a pro — say *what* improves and *for whom*)
- At least one Con must be named for every recommendation. If you can't think of one, the recommendation may not be ready
- Decision column starts as "Pending user" and is updated when the user approves / rejects / defers

## Overall: APPROVED / NEEDS REVISION
```

Severity rubric:

| Severity | Definition |
|----------|-----------|
| **Major** | A new reader would be confused, misled, or click away. Examples: skipped heading levels that break the ToC; section that reads like raw machine output; jargon dump with no explanation; wall of text where structure was needed. |
| **Minor** | Polish — phrasing tightening, whitespace cleanup, consistency tweaks. Nice to have, won't lose readers. |

### Step 6: Apply Fixes (if `--fix` requested)

The audit may identify issues at three different scopes. `--fix` only applies the small scope automatically; medium and large always need the user in the loop.

| Scope | What it touches | Behavior |
|-------|-----------------|----------|
| **Small** | Whitespace adjustments, heading-level fixes, emphasis (`**` / `*` / inline code), sentence-level rewording, stale link or version updates, typo corrections | Apply in batch after one confirmation of the Major + Minor groups |
| **Medium** | Splitting one section into two, merging two adjacent sections, adding a missing subsection (`###`) inside an existing section, rewording a heading | Report recommends; user approves each medium change individually before apply |
| **Large** | Reordering top-level sections, renaming H2 headings (breaks external anchors), creating new H2 sections, removing existing sections, drafting new content longer than one paragraph | Report flags as a recommendation only. Never applied by `--fix`. The user must explicitly request the skill to draft the change for review, then approve before apply |

#### `--fix` flow

1. Present the full report first — including the **Structural Recommendations** table with pros/cons for every Medium and Large item.
2. For **Small** changes: ask for a single batch confirmation (Major group, then Minor group). Apply one section at a time, smallest blast radius first.
3. For **Medium** changes: walk through each one with the user. Show pros + cons. Get per-change approval before apply.
4. For **Large** changes: do NOT apply under `--fix`. Leave them in the report as recommendations with full pros/cons. If the user wants one drafted, they ask explicitly ("draft the new Prerequisites section"), the skill writes a proposal, and the user approves before any write happens.
5. Re-score affected sections after fixes to confirm improvement.

**The principle:** the audit's job is to see everything that hurts the reader. The skill's authority to *change* what it sees scales with reversibility. Small changes are easy to revert; large structural changes affect external links, search indexing, and reader expectations across the project's ecosystem — those stay under the user's direct control.

## Expected Input

- `(no args)` → audit `README.md` at the repo root
- `<path>` → audit any user-facing markdown file at that path
- Append `--fix` to apply fixes after the report

## Relationship to other audit skills

| Skill | Audience | Focus |
|-------|----------|-------|
| `auditing-readme` (this) | Public reader on GitHub | Typography + Phrasing — readability |
| `auditing-artifacts` | The agent executing this project | Format + Purpose — internal correctness |
| `reviewing-typography` (source skill) | Confluence reader | Proximity + hierarchy on rendered HTML |
| `reviewing-commands` (source skill) | Command authors | 6-dimension deep audit of one command |

## Next Step

After the report, common follow-ups:
- Apply Major fixes immediately — these are the ones costing you readers
- Sweep Minors as a polish pass before a release or external announcement
- Re-run after edits to confirm scorecard improvement
