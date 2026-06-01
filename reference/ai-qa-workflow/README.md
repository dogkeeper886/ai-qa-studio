# AI QA Workflow

A QA automation toolkit that connects AI coding agents with test management systems through MCP (Model Context Protocol). Slash commands and agent skills cover the full test lifecycle — from Jira ticket to TestLink execution.

## Project Goal

Enable **end-to-end test automation** from a single source of truth. Instead of manually copying information between Jira, Confluence, TestLink, and test scripts, AI coding agents:

1. **Discover** requirements from Jira and Confluence via MCP
2. **Plan** test strategies using intelligent checklists
3. **Design** detailed test cases from requirements
4. **Manage** tests in TestLink via MCP
5. **Automate** test execution with the dual-judge framework
6. **Report** results back to source systems

## Notable Features

| Feature | Description |
|---------|-------------|
| **Agent-Driven Installation** | No installer script — the AI agent reads CLAUDE.md, detects context, and syncs commands |
| **Two-Tier Architecture** | Home tier (universal) + project tier (specific) eliminates duplication across projects |
| **Single Source of Truth** | Requirements flow from Jira/Confluence through test design to execution |
| **MCP Integrations** | Direct access to Atlassian, TestLink, and Playwright via Model Context Protocol |
| **Detect-and-Route** | Entry commands detect the type of work (new feature / enhancement / bug fix) and hand off to the right specialist command |
| **Agent Skills** | Thin routers covering complete lifecycle phases with progress checklists |
| **Dual-Judge Framework** | Test execution checked by both deterministic assertions and an LLM judge — catches the cases each misses |
| **Self-Improvement** | `/evolve` analyzes project history and proposes actionable improvements |

## Quick Start

### Installation

Installation is agent-driven — no installer script, no build step. Your AI agent reads `CLAUDE.md` and does the work.

```
git clone https://github.com/dogkeeper886/ai-qa-workflow
```

Then tell your AI agent:

> "Read /path/to/ai-qa-workflow/CLAUDE.md and install the commands I need"

The agent will:
1. Detect your project context and configured MCP servers
2. Recommend relevant modules (e.g., Jira commands if you use mcp-atlassian)
3. Ask where to install — home folder or project folder (see [Two-Tier Architecture](#two-tier-architecture))
4. Compare with any existing commands and sync only the differences

### After Installation

**Activate:**

1. Restart your IDE to load new commands
2. Configure MCP integrations (see [docs/integrations/](docs/integrations/))

**What's now available:**

- Skills as slash commands (e.g., `/receiving-tickets`)
- Individual commands (e.g., `/jr-trace`)

### Updating

Same flow — tell your agent to re-read `CLAUDE.md`. It compares, detects changes, and syncs updates. Use `/compare` to preview drift before syncing.

## Two-Tier Architecture

Commands are organized in two tiers to reduce maintenance across multiple projects:

| Tier | Location | Scope | What belongs here |
|------|----------|-------|-------------------|
| **Home** | `~/.claude/commands/` | Every project | Universal commands that work without modification anywhere |
| **Project** | `.claude/commands/`, `.claude/skills/` | One project | Commands needing project-specific MCP servers or paths |

**Home tier** — install once, use everywhere:
- Utility: `rewrite-text`, `evolve`, `session-summary`, `compare`, `sync`, `command-review`, `review-install`, `robot-log-analyzer`
- Dev Workflow: `dw-story`, `dw-plan`, `dw-implement`, `dw-create-pr`, `dw-review-pr`, `dw-merge`

**Project tier** — install per project as needed:
- Jira (`jr-*`), Confluence (`cf-*`), TestLink (`tl-*`), Test Workflow (`tw-*`), GitHub (`gh-*`), Project (`pm-*`), Skills

### Maintenance Tools

| Command | Purpose |
|---------|---------|
| `/review-install` | Audit your setup — catches duplicates, misplacements, and drift |
| `/compare` | Detect what's out of sync between source repo and installed commands |
| `/sync` | Push updates from source to target |

## Complete Test Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         COMPLETE TEST LIFECYCLE                         │
└─────────────────────────────────────────────────────────────────────────┘

  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
  │ DISCOVER │ → │ BASELINE │ → │   PLAN   │ → │  DESIGN  │
  └──────────┘   └──────────┘   └──────────┘   └──────────┘
                                                     │
                                                     ▼
  ┌──────────┐   ┌──────────┐   ┌──────────┐
  │ EXECUTE  │ ← │ AUTOMATE │ ← │  MANAGE  │
  └──────────┘   └──────────┘   └──────────┘
```

| Phase | Action | Skill | Key Command |
|-------|--------|-------|-------------|
| 1. Discover | Gather requirements | `/receiving-tickets` | `/jr-trace` |
| 2. Baseline | Capture live UI state (recommended before planning) | — | `/tw-baseline-trace` |
| 3. Plan | Create test strategy | `/planning-tests` | `/tw-plan-init` |
| 4. Design | Write test cases | `/designing-cases` | `/tw-case-init` |
| 5. Manage | Import to TestLink | `/syncing-testlink` | `/tl-sync` |
| 6. Automate | Create YAML tests | — | [test-framework-template](https://github.com/dogkeeper886/test-framework-template) |
| 7. Execute | Run & record results | `/executing-tests` | `/tl-execute-case` |

See [docs/workflows/test-lifecycle.md](docs/workflows/test-lifecycle.md) for the complete workflow guide.

## Agent Skills

Skills are the recommended high-level interface. Each skill is a thin router that covers a complete lifecycle phase with a built-in progress checklist, delegating to slash commands for each step.

| Skill | Phase | Description |
|---|---|---|
| `/receiving-tickets` | Discover | Fetch Jira ticket, linked issues, Confluence pages; create project workspace |
| `/planning-tests` | Plan | Detect ticket type, write test plan, publish to Confluence (ISO 29119-3 layout) |
| `/designing-cases` | Design | Write test cases from plan, publish to Confluence |
| `/reviewing-typography` | Design | Audit just-published Confluence pages for typography (Gestalt proximity + visual hierarchy) — runs after `planning-tests` / `designing-cases` publish |
| `/drafting-review-email` | Review | Draft stakeholder review email and meeting invite |
| `/syncing-testlink` | Manage | Sync test cases into TestLink with suites, plans, and assignments |
| `/executing-tests` | Execute | Execute test plan via browser automation, record pass/fail |
| `/creating-demo` | — | Create demo PPTX with content outline and browser-verified screenshots |
| `/analyzing-logs` | Report | Analyze Robot Framework logs, group failures, suggest fixes |
| `/tracking-changes` | Track | Track QA artifact changes in GitHub with full provenance |
| `/reviewing-commands` | — | Audit slash commands against quality dimensions and best practices |

See [docs/workflows/skills.md](docs/workflows/skills.md) for invocation patterns, trigger phrases, and MCP requirements per skill.

## Issue-Driven Development

The dev workflow commands (`dw-*`) provide a structured development lifecycle where every change is driven by a GitHub issue.

```
/dw-plan → /dw-implement → /dw-create-pr → /dw-review-pr → /dw-merge
    │            │               │                │              │
 Create      Branch &        Push & open       Approve or    Merge PR,
 issues      implement       PR (Fixes #N)     request       auto-close
 with        on feature      with summary       changes       issue,
 labels      branch          & test plan                      clean up
```

```
/dw-plan Add cross-repo sync commands     # Break request into GitHub issues
/dw-implement 27                           # Pick up issue, create branch, implement
/dw-create-pr 27                           # Push branch, open PR linked to issue
/dw-review-pr 30                           # Review PR against checklist
/dw-merge 30                               # Merge PR, clean up branch and labels
```

Branches follow `issue-<N>-<short-slug>` convention (e.g., `issue-27-release-notes`). Issues get status labels and progress comments automatically. The PR's `Fixes #N` auto-closes the issue on merge.

## Self-Improvement Loop

The `/evolve` command analyzes project history and proposes improvements to CLAUDE.md, commands, and skills.

```
/evolve                     # Full analysis (issues + commits, last 90 days)
/evolve issues              # Analyze GitHub issues only
/evolve commits             # Analyze git commits only
/evolve --since 30d         # Override time range
```

**How it works:** Collects GitHub issues, git commits, and session summaries → detects workflow gaps, friction points, usage patterns, and knowledge decay → scores each finding by confidence → proposes grouped actions → applies selected changes with confirmation.

**Integration with `/session-summary`:** When session summaries exist, `/evolve` incorporates recurring friction points (3+ occurrences become high-confidence insights) into its analysis. Reports are saved to `docs/evolve/`.

## Available Commands

### [Jira Commands (jr-*)](commands/jira/)
Trace tickets and fetch linked issues.

`jr-trace` · `jr-trace-fetch` · `jr-trace-structure` · `jr-trace-docs` · `jr-trace-verify`

### [Confluence Commands (cf-*)](commands/confluence/)
Create, update, and review Confluence pages.

`cf-create-page` · `cf-update-page` · `cf-review-page` · `cf-format-guide`

### [Test Workflow Commands (tw-*)](commands/test-workflow/)
Plan test strategies and design test cases, with fan-out routing by ticket type (feature/enhance/bugfix). Includes `tw-baseline-trace` to capture the live UI state via Playwright before scenarios are drafted (anchors the plan in observable reality, prevents over-specified test plans — see `skills/planning-tests/references/scenario-conventions.md`).

`tw-baseline-trace` · `tw-plan-init` · `tw-plan-feature` · `tw-plan-enhance` · `tw-plan-bugfix` · `tw-plan-review` · `tw-case-init` · `tw-case-feature` · `tw-case-enhance` · `tw-case-bugfix` · `tw-case-review` · `tw-case-publish` · `tw-case-verify-refs` · `tw-diagrams` · `tw-script-review` · `tw-templates`

### [TestLink Commands (tl-*)](commands/testlink/)
Manage test suites, cases, plans, and execution results in TestLink via MCP.

`tl-list-projects` · `tl-list-suites` · `tl-list-cases` · `tl-list-requirements` · `tl-create-suite` · `tl-create-case` · `tl-get-case` · `tl-get-cases-for-plan` · `tl-update-case` · `tl-update-suite` · `tl-create-plan` · `tl-add-case-to-plan` · `tl-create-execution` · `tl-read-execution` · `tl-execute-case` · `tl-sync` · `tl-identify-type` · `tl-format`

### [GitHub Commands (gh-*)](commands/github/)
Set up milestone/label tracking for QA artifacts and monitor progress through GitHub issues.

`gh-init` · `gh-track` · `gh-status` · `gh-close`

### [Dev Workflow Commands (dw-*)](commands/dev-workflow/)
Issue-driven development lifecycle: plan issues, implement on branches, open PRs, review, and merge.

`dw-story` · `dw-plan` · `dw-tasks` · `dw-implement` · `dw-test-design` · `dw-create-pr` · `dw-review-pr` · `dw-merge`

### [Project Commands (pm-*)](commands/project/)
Cross-cutting project management: bug reports, scrum tasks, meeting invites, demo materials, and script review.

`pm-init` · `pm-bug-report` · `pm-meeting-invite` · `pm-demo-content` · `pm-demo-review` · `pm-demo-ppt` · `pm-demo-email` · `pm-script-review`

### [Utility Commands](commands/utility/)
Text rewriting, log analysis, self-improvement, cross-repo sync, installation auditing, and command quality review.

`rewrite-text` · `robot-log-analyzer` · `evolve` · `session-summary` · `command-review` · `compare` · `sync` · `review-install`

## Documentation

### Integrations

**Required** — used by current commands:

- [MCP Atlassian](docs/integrations/mcp-atlassian.md) - Jira and Confluence access
- [MCP TestLink](docs/integrations/mcp-testlink.md) - Test management
- [MCP Playwright](docs/integrations/mcp-playwright.md) - Browser automation

**Optional** — documented but not currently called by any command:

- [MCP WPA](docs/integrations/mcp-wpa.md) - WPA supplicant control
- [MCP RADIUS SQL](docs/integrations/mcp-radius-sql.md) - RADIUS database queries

**Related framework:**

- [Test Framework Template](docs/integrations/test-framework-template.md) - Dual-judge execution

### Workflows

- [Agent Skills](docs/workflows/skills.md) - Skills guide: invocation, trigger phrases, MCP requirements
- [Test Lifecycle](docs/workflows/test-lifecycle.md) - Complete end-to-end workflow
- [Trace and Evolve](docs/workflows/trace-and-evolve.md) - GitHub tracking, session summaries, and continuous improvement loop

### Design

- [Principles](docs/design/principles.md) - Core design guidelines
- [Orchestration Pattern](docs/design/orchestration.md) - Detect-and-route pattern with sequential, fan-out, and smart-diff styles

### References

- [Command Format](docs/references/command-format.md) - Slash command format specification
- [Skill Format](docs/references/skill-format.md) - Skill directory and SKILL.md format

## Related Projects

| Project | Purpose | Repository |
|---------|---------|------------|
| **Test Framework Template** | Dual-judge test execution | [dogkeeper886/test-framework-template](https://github.com/dogkeeper886/test-framework-template) |
| **TestLink MCP** | TestLink API integration | [dogkeeper886/testlink-mcp](https://github.com/dogkeeper886/testlink-mcp) |
| **MCP Atlassian** | Jira/Confluence integration | [sooperset/mcp-atlassian](https://github.com/sooperset/mcp-atlassian) |

## Project Structure

```
ai-qa-workflow/
├── commands/
│   ├── confluence/     # Confluence commands (cf-*)
│   ├── dev-workflow/   # Dev lifecycle commands (dw-*)
│   ├── github/         # GitHub tracking commands (gh-*)
│   ├── jira/           # Jira commands (jr-*)
│   ├── project/        # Project management commands (pm-*)
│   ├── testlink/       # TestLink commands (tl-*)
│   ├── test-workflow/  # Test planning and case workflows (tw-*)
│   └── utility/        # Utility commands
├── skills/
│   ├── analyzing-logs/        # Robot Framework log analysis
│   ├── creating-demo/         # Demo PPTX generation
│   ├── designing-cases/       # Write test cases
│   ├── drafting-review-email/ # Stakeholder review email
│   ├── executing-tests/       # Browser test execution
│   ├── planning-tests/        # Create test plan (ISO 29119-3 layout)
│   ├── receiving-tickets/     # Fetch ticket, create workspace
│   ├── reviewing-commands/    # Command quality auditing
│   ├── reviewing-typography/  # Audit just-published Confluence pages
│   ├── syncing-testlink/      # Import cases to TestLink
│   └── tracking-changes/      # GitHub artifact tracking
├── templates/          # Sample CLAUDE.md for projects adopting this workflow
├── docs/
│   ├── design/         # Design principles and patterns
│   ├── examples/       # Sample command outputs
│   ├── integrations/   # MCP integration guides
│   ├── references/     # Command and skill format specs
│   └── workflows/      # End-to-end workflows
└── README.md
```

## For Developers

### Adding New Commands

1. Create markdown file in the appropriate `commands/` subfolder
2. Follow the [command format spec](docs/references/command-format.md) (or use existing commands as examples)
3. Tell your AI agent to re-read `CLAUDE.md` and sync the new command
4. Commit only the source file

### Adding New Skills

1. Create `skills/<gerund-name>/SKILL.md` with YAML frontmatter (`name`, `description`)
2. Route each step to an existing slash command — skills should not duplicate command logic
3. Tell your AI agent to re-read `CLAUDE.md` and sync the new skill
4. Commit only the source file under `skills/`

### Updating Commands

Pull the latest changes, then tell your AI agent to re-read `CLAUDE.md` — it will compare and sync updates automatically. Use `/review-install` to audit across projects.

## License

MIT
