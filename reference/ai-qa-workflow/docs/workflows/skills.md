# Agent Skills

Agent skills are thin routers that orchestrate complete lifecycle phases by delegating to slash commands. Each skill provides a progress checklist, validation steps, and step-by-step routing — so you invoke one command instead of manually chaining sub-commands.

## Skills vs Commands

| | Agent Skills | Slash Commands |
|---|---|---|
| **Role** | Router — orchestrates a workflow phase | Operation — performs one atomic task |
| **Invocation** | `/skill-name` or natural language trigger | Exact `/command-name` required |
| **Scope** | One skill = one complete workflow phase | One command = one atomic operation |
| **Guidance** | Built-in progress checklist, validation steps | None |
| **Discovery** | Model detects intent from your description | Must know the exact command name |
| **Side effects** | `disable-model-invocation: true` prevents auto-run | No guard |

Skills do not replace commands — the underlying 53 commands remain available for targeted use. Skills bundle them into guided, end-to-end workflows.

## Available Skills

| Skill | Invoke as | Lifecycle Phase | Trigger Phrases |
|---|---|---|---|
| `receiving-tickets` | `/receiving-tickets` | 1 — Discover | "receive a ticket", "start a project", "trace a ticket", "set up workspace" |
| `planning-tests` | `/planning-tests` | 2 — Plan | "plan tests", "create a test plan", "write a test plan", "start test planning" |
| `designing-cases` | `/designing-cases` | 3 — Design | "design cases", "create test cases", "write test cases", "expand scenarios" |
| `drafting-review-email` | `/drafting-review-email` | 3 — Design (review) | "draft a review email", "create meeting invite", "notify stakeholders" |
| `syncing-testlink` | `/syncing-testlink` | 4 — Manage | "sync TestLink", "import to TestLink", "upload test cases", "push to TestLink" |
| `executing-tests` | `/executing-tests` | 4 — Manage + 6 — Execute | "execute tests", "run tests", "execute a test plan", "run test cases" |
| `creating-demo` | `/creating-demo` | — | "create a demo", "build demo slides", "make a demo presentation" |
| `analyzing-logs` | `/analyzing-logs` | 6 — Execute | "analyze logs", "check test logs", "why did tests fail", "investigate output.xml" |

## Skill-to-Command Routing Map

Each skill routes to specific slash commands:

| Skill | Routes To |
|---|---|
| `receiving-tickets` | `/jr-trace-fetch` → `/jr-trace-structure` → `/jr-trace-docs` → `/jr-trace-verify` → `/pm-init` (optional) |
| `planning-tests` | `/tw-plan-init` → `/tw-plan-feature\|bugfix\|enhance` → `/tw-plan-review` → `/tw-diagrams` → `/cf-create-page` → `/cf-review-page` |
| `designing-cases` | `/tw-case-init` → `/tw-case-feature\|bugfix\|enhance` → `/tw-case-review` → `/cf-create-page` → `/cf-review-page` |
| `drafting-review-email` | `/pm-demo-email` + `/pm-meeting-invite` |
| `syncing-testlink` | `/tl-create-suite` → `/tl-create-case` (with `/tl-format`) → `/tl-create-plan` → `/tl-add-case-to-plan` |
| `executing-tests` | `/tl-read-execution` → `/tl-execute-case` → `/tl-create-execution` |
| `creating-demo` | `/pm-demo-content` → `/pm-demo-review` → `/pm-demo-ppt` |
| `analyzing-logs` | `/robot-log-analyzer` + `/rewrite-text` |

## Invoking Skills

### By slash command

```
/receiving-tickets
/planning-tests
/designing-cases
/drafting-review-email
/syncing-testlink
/executing-tests
/creating-demo
/analyzing-logs
```

### By natural language (model-detected)

Skills with trigger phrases in their description can be invoked by describing what you want:

```
"I just received ticket PROJ-12345, can you set up the workspace?"
→ invokes /receiving-tickets

"Let's plan tests for this project"
→ invokes /planning-tests

"Analyze the Robot Framework output at /path/to/output.xml"
→ invokes /analyzing-logs
```

> **Note:** `executing-tests`, `syncing-testlink`, `creating-demo`, `planning-tests`, `designing-cases`, `drafting-review-email`, and `receiving-tickets` all have `disable-model-invocation: true`. The model will prompt you to confirm before running them, since they write files or call external APIs. `analyzing-logs` is read-only and can be auto-invoked.

## Skill Structure

Each skill lives under `skills/<name>/` as a single file:

```
skills/receiving-tickets/
└── SKILL.md              # Frontmatter + steps + progress checklist
```

`SKILL.md` contains the step sequence and progress checklist. Each step routes to a slash command for implementation details — no duplicated logic.

### SKILL.md frontmatter

```yaml
---
name: receiving-tickets         # gerund form, max 64 chars
description: |                  # third person; what + when; max 1024 chars
  Fetches a Jira ticket with all linked tickets and Confluence pages, then
  creates a standardized project workspace folder. Use when a QA engineer
  receives a new Jira ticket, wants to start a project, or trace a ticket.
disable-model-invocation: true  # set on all skills with side effects
tools:                          # MCP tools used (fully qualified server:tool_name)
  - mcp-atlassian:jira_get_issue
  - mcp-atlassian:confluence_get_page
---
```

## End-to-End Skill Flow

```
/receiving-tickets  →  /planning-tests  →  /designing-cases
        │                     │                    │
        │               /drafting-review-email ◄───┘
        │
        └──────────────────► /syncing-testlink  →  /executing-tests
                                                         │
                                              /analyzing-logs (post-run)
```

Optionally, after executing tests:
```
/creating-demo  →  /drafting-review-email
```

## Installation

Skills are installed alongside commands via agent-driven installation:

```
Tell your AI agent: "Read CLAUDE.md and install the commands and skills I need"
```

The agent will detect your project context, recommend relevant modules, and sync skills to `.claude/skills/`. After installation, restart Claude Code to load the skills.

## MCP Requirements per Skill

| Skill | Required MCP Servers |
|---|---|
| `receiving-tickets` | mcp-atlassian |
| `planning-tests` | mcp-atlassian |
| `designing-cases` | mcp-atlassian |
| `drafting-review-email` | mcp-atlassian |
| `syncing-testlink` | testlink-mcp |
| `executing-tests` | testlink-mcp, playwright-mcp |
| `creating-demo` | playwright-mcp |
| `analyzing-logs` | _(none — reads local files only)_ |

See [docs/integrations/](../integrations/) for MCP server configuration.
