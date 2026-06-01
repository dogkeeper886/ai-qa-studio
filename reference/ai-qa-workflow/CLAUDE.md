# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI QA Workflow is a QA automation toolkit that connects AI coding agents with test management systems through MCP (Model Context Protocol) integrations. It provides slash commands and skills for end-to-end test automation across Jira, Confluence, TestLink, Playwright, and GitHub.

## Git Workflow

- Default: open PR for review before merging
- PRs require review approval before merging
- Delete the feature branch after merging

### Direct Push to Main

Trivial, low-risk changes may be committed and pushed directly to main without a PR:
- Docs-only changes (adding/editing markdown, no code)
- Typo or formatting fixes
- CLAUDE.md or config-only updates

Everything else (code changes, new commands/skills, refactors) requires a feature branch and PR.

### Branch Naming

- General work: `feature/<description>` (e.g. `feature/add-sync-commands`)
- Issue-based work: `issue-<N>-<slug>` (e.g. `issue-27-release-notes`)

### PR Conventions

- Title: short, imperative, under 70 characters
- Body: include `Fixes #N` or `Closes #N` to auto-close the linked issue
- Body: include `## Summary` (1-3 bullet points) and `## Test plan` sections

### Dev Workflow Commands

For structured issue-driven development, use the `dw-*` commands:
1. `/dw-story` — Create structured user story from requirements
2. `/dw-plan` — Break request into GitHub issues with labels
3. `/dw-tasks` — Break an existing story file into GitHub issues
4. `/dw-implement` — Pick up issue, create branch, implement (story-aware)
5. `/dw-test-design` — Design tests for the implementation (detects project test infra)
6. `/dw-create-pr` — Push and open PR with issue linkage (story-aware)
7. `/dw-review-pr` — Review PR against checklist (adapts to CI and project type)
8. `/dw-merge` — Merge PR and clean up (story-aware)

## Information Leak Check

This is an open-source repository. Before committing, verify no private identifiers remain in `commands/` or `demo/`:

All commands must return **no results**. Examples must use only generic placeholders:

| Type | Allowed Pattern | Example |
|------|----------------|---------|
| Jira ticket | `PROJ-NNNNN` | `PROJ-12345` |
| Feature request | `FR-NNNN` | `FR-1234` |
| Confluence page ID | Generic digits | `123456789` |
| Project name | `User Session Management` / `USM` | |
| Product name | `Cloud management platform` | |

## Installation

Installation is agent-driven. When an AI agent reads this file, it should guide the user through installing commands and skills using the compare/sync protocol.

### Agent Installation Flow

1. **Orient** — Read this CLAUDE.md to understand available modules (see Directory Structure and Skills sections)
2. **Detect context** — Examine the user's current working directory:
   - Read its CLAUDE.md (if it exists) to understand the project
   - Check what MCP servers are configured: look in `.claude/settings.local.json`, `mcp.json`, or ask the user
   - Check what's already installed in `.claude/commands/` and `.claude/skills/` (project and home)
   - If no project context is detected (e.g., empty directory), ask the user what they're working on
3. **Ask the user**:
   - Where to install: project folder (`.claude/commands/`) or home folder (`~/.claude/commands/`), or per-module
   - What modules to install: recommend based on context, let user override
4. **Compare & sync** — Read `commands/utility/compare.md` and `commands/utility/sync.md` for the protocol, then:
   - Compare source (`commands/`) with target for each selected module
   - Classify each file: new / identical / diverged / target-only
   - For key changes: prompt user with explanation before applying
   - Adapt project-specific values when installing into a different repo
5. **Report** — Save a summary of what was installed, updated, or skipped

### Module Groups

| Module | Default Target | Reason |
|--------|---------------|--------|
| Utility (rewrite-text, evolve, session-summary) | `~/.claude/commands/` | Universal, useful in any project |
| Compare, sync, command-review, review-install | `~/.claude/commands/` | Cross-repo tools, used everywhere |
| Dev Workflow (dw-*) | `~/.claude/commands/` | Generic dev lifecycle |
| Jira (jr-*) | `.claude/commands/` | Project-specific, needs mcp-atlassian |
| Confluence (cf-*) | `.claude/commands/` | Project-specific, needs mcp-atlassian |
| TestLink (tl-*) | `.claude/commands/` | Project-specific, needs testlink-mcp |
| Test Workflow (tw-*) | `.claude/commands/` | Project-specific |
| GitHub (gh-*) | `.claude/commands/` | Project-specific |
| Project (pm-*) | `.claude/commands/` | Project-specific |
| Skills | `.claude/skills/` | Project-specific, lifecycle phases |

### Tier Design

Commands and skills are organized in two tiers to reduce maintenance across multiple projects:

| Tier | Location | Scope | What belongs here |
|------|----------|-------|-------------------|
| **Home** | `~/.claude/commands/` | Every project | Universal commands that work without modification in any project |
| **Project** | `.claude/commands/`, `.claude/skills/` | One project | Commands with project-specific paths, tools, or workflow patterns |

**Decision rule:** If a command references no project-specific paths, tools, or patterns → home level. Otherwise → project level.

**Same-name conflict:** Home level wins. A project-level command with the same name as a home command is shadowed (unreachable) and should be removed.

**Audit:** Run `/review-install` to detect duplicates, misplacements, and drift between home, project, and this source repo.

### First-Time Home Setup

When adopting ai-qa-workflow across multiple projects for the first time:

1. **Create `~/.claude/CLAUDE.md`** — Define your identity (roles, project types), universal git workflow rules, information leak prevention rules, and the command hierarchy (what's at home vs project level)
2. **Install home-level commands** — Copy universal commands from this repo to `~/.claude/commands/`:
   - `commands/utility/` → evolve, session-summary, compare, sync, command-review, review-install, rewrite-text, robot-log-analyzer
   - `commands/dev-workflow/` → dw-story, dw-plan, dw-tasks, dw-implement, dw-test-design, dw-create-pr, dw-review-pr, dw-merge
3. **Audit all projects** — Run `/review-install all` to scan every project for duplicates, misplacements, and drift
4. **Clean up duplicates** — Run `/review-install --fix` per project to remove commands shadowed by home level
5. **Update project CLAUDE.md files** — Remove references to deleted commands, update counts and listings

### Ongoing Maintenance

- **After updating a command in ai-qa-workflow:** copy it to `~/.claude/commands/` and run `/review-install all` to check for drift
- **After adding a new project:** run `/review-install` in that project to verify no duplicates
- **Periodic audit:** run `/review-install all` quarterly to catch drift and info leaks

### Updates

Updates follow the same flow as installation. The agent re-reads this CLAUDE.md (from the latest repo — local or GitHub), compares with what's installed, and syncs changes. Key or breaking changes should prompt the user and save a report.

## Architecture

### Three-Tier Route: CLAUDE.md → Skills → Commands

The agent navigates this project in three layers. Each layer has a specific job and a specific size.

1. **CLAUDE.md (this file) — Orientation.** Read first. Provides the project overview, directory map, Skills table (when to invoke what), and Key Workflows (the 7-phase test lifecycle). The agent reads CLAUDE.md to find the right entry point for the user's intent.

2. **Skills (`skills/<name>/SKILL.md`) — Routers.** Loaded on demand when the trigger condition matches. Each skill is a thin step sequence + progress checklist; it orchestrates the workflow and delegates implementation to commands. Skills answer WHAT to do at the workflow level. Typical size: 50-150 lines.

3. **Commands (`commands/<folder>/<cmd>.md`) — Implementation.** Hold the detail: MCP tool names, parameter shapes, HTML formatting rules, API quirks, error handling. Commands answer HOW each step is executed. Size varies by complexity — some are 8 lines, some are 500.

### Why the layering

- **Skills stay lean** because the heavy lifting lives in commands.
- **Commands can be minimal where the task is LLM-native** (e.g., "summarize this page" needs no instructions beyond the MCP tool name) and rich where it's not (e.g., a TestLink CRUD command with HTML formatting and entity encoding).
- **CLAUDE.md changes once** when adding a new workflow; skills change per orchestration tweak; commands change per integration detail.

### When to write what

| You're adding... | Touch... |
|------------------|----------|
| A new top-level workflow / lifecycle phase | CLAUDE.md (Skills table, Key Workflows) + new skill + supporting commands |
| A new step in an existing workflow | Existing skill (insert step) + new command (the step's detail) |
| A new way to call an existing integration | New command in the right subfolder; no skill change needed |
| A reusable convention (HTML rules, format guides) | Reference command (e.g. `tl-format`) + cross-references from siblings |

### Command-as-Documentation Pattern

Each command markdown file is both documentation and executable instruction. Commands include: purpose, expected input format, step-by-step processing, MCP call details. Skills are installed to `.claude/skills/`; commands are installed to `.claude/commands/` or `~/.claude/commands/` depending on whether they're project-specific or universal (see [Tier Design](#tier-design)).

### Directory Structure

```
commands/
├── confluence/    # Confluence page operations (cf-*)
├── dev-workflow/  # Dev lifecycle: story, plan, implement, PR, review, merge (dw-*)
├── github/        # GitHub tracking and traceability (gh-*)
├── jira/          # Jira ticket tracing and conversion (jr-*)
├── project/       # Project management commands (pm-*)
├── testlink/      # TestLink CRUD and execution (tl-*)
├── test-workflow/ # Test planning and case workflows (tw-*)
└── utility/       # Text rewriting, log analysis, self-improvement, cross-repo sync
skills/
├── receiving-tickets/    # Fetch Jira ticket + set up project workspace
├── planning-tests/       # Create test plan from ticket, publish to Confluence
├── designing-cases/      # Write test cases from plan, publish to Confluence
├── reviewing-typography/ # Audit just-published Confluence pages for proximity / hierarchy issues
├── drafting-review-email/ # Draft stakeholder review email + meeting invite
├── syncing-testlink/     # Import test cases into TestLink, build test plan
├── executing-tests/      # Execute TestLink plan via browser automation
├── creating-demo/        # Create PPTX demo with browser-verified screenshots
├── analyzing-logs/       # Analyze Robot Framework logs, report failures
├── tracking-changes/     # Track QA artifact changes in GitHub
└── reviewing-commands/   # Audit command quality against best practices
docs/
├── design/        # Design principles
├── examples/      # Sample command outputs
├── integrations/  # MCP server setup guides
├── references/    # Claude Code command and skill format specs
└── workflows/     # End-to-end test lifecycle guide
```

### MCP Dependencies

Commands expect these MCP servers configured in the IDE:
- **mcp-atlassian** (sooperset/mcp-atlassian) - Jira/Confluence API access
- **testlink-mcp** (dogkeeper886/testlink-mcp) - TestLink API access
- **playwright-mcp** (microsoft/playwright-mcp) - Browser automation

Additional integrations documented in `docs/integrations/` but not currently used by any command: `wpa-mcp` (WPA supplicant control), `radius-sql` (RADIUS database queries).

## Adding New Commands

1. Create markdown file in appropriate `commands/` subfolder
2. Follow the conventions of sibling commands in the same subfolder. Two reference exemplars:
   - **Task commands** (multi-step workflows with `gh`/MCP calls): `commands/dev-workflow/dw-implement.md` — `## PURPOSE`, `## WORKFLOW` (ASCII tree), `## EXAMPLE`, `## API Notes`
   - **Reference commands** (rules/conventions): `commands/utility/rewrite-text.md` — minimal task statement + guidelines table
3. Tell your AI agent to re-read `CLAUDE.md` and sync the new command
4. Commit only the source file in `commands/`

## Skills

Skills are loaded on demand. The agent reads this table to decide which skill to invoke.

| Skill | Trigger Condition |
|-------|-------------------|
| `receiving-tickets` | When given a Jira ticket ID to investigate or start a new QA project |
| `planning-tests` | When requirements are gathered and a test plan is needed |
| `designing-cases` | When a test plan exists and detailed test cases need to be written |
| `reviewing-typography` | After `planning-tests` / `designing-cases` publish — audit the just-published Confluence pages for proximity + hierarchy problems on actual rendered content |
| `drafting-review-email` | When test artifacts are ready for stakeholder review |
| `syncing-testlink` | When test cases need to be imported into TestLink |
| `executing-tests` | When a TestLink test plan is ready for browser-based execution |
| `creating-demo` | When a demo presentation needs to be created from test results |
| `analyzing-logs` | When Robot Framework logs need failure analysis |
| `tracking-changes` | When QA artifacts are created, modified, or reviewed — track in GitHub |
| `reviewing-commands` | When command files need quality auditing against best practices |

Skills are thin routers — each SKILL.md contains the step sequence and progress checklist, delegating to commands for implementation details. Do not load all skills at once; load only when the trigger condition matches.

## Key Workflows

The test lifecycle flows through 7 phases:
1. **Discover** - Gather requirements via `/jr-trace`
2. **Baseline** - Capture live UI state via `/tw-baseline-trace` (recommended before planning)
3. **Plan** - Create test strategy via `/tw-plan-init` (routes to feature/enhance/bugfix). Plans follow the ISO/IEC/IEEE 29119-3 layout: `test_plan/sections/` (lean strategy) + `test_plan/test_design/{scenarios/, traceability_matrix.md, risk_register.md}`. The Confluence publish runs `reviewing-typography` as its final gate.
4. **Design** - Write test cases via `/tw-case-init` (routes to feature/enhance/bugfix); same typography gate after publish
5. **Manage** - Import to TestLink via `/tl-create-case`
6. **Automate** - Create YAML tests with test-framework-template
7. **Execute** - Run tests and record via `/tl-create-execution`

## TestLink HTML Formatting

TestLink commands automatically apply HTML formatting:
- Summaries: `<p>` tags with `<strong>` for emphasis
- Preconditions: `<ul><li>` lists
- Steps: `<p>` for actions, `<br>•` or `<ul><li>` for expected results
- HTML entities: `&gt;`, `&lt;`, `&quot;`, `&amp;`, `&apos;`
