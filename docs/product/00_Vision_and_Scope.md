# AI QA Studio — Vision & Scope

## Vision

An **AI-driven framework that closes the Dev → QA → PM loop**, delivered as one
product that holds the pieces together. In the real world people reach for a single
product that ties their process into one place. AI QA Studio is that face — the
visual layer over an AI-driven QA process.

## The repos it binds

AI QA Studio (this repo) is the product face; it binds two sibling repos so the three
work as one:

| Repo | Role |
|------|------|
| `ai-qa-workflow` | the QA methodology — the agent's brain (skills / commands) |
| `test-framework-template` | authoring and running the test scripts |
| `ai-qa-studio` (this) | the **visual dashboard + studio** — the product face for QA activities |

## The deep problem: proprietary coupling

The current process leans on proprietary systems — chiefly **Jira** (intake / PM) and
**Jenkins** (test execution / CI). Experience across the real stack (`testlink-mcp`,
`wpa-mcp`, `ruckus1-mcp`, `ollama37`) shows both can go **GitHub-native**:

- **Jira → story files in GitHub.** Intake and PM become markdown files (stories) plus
  issues — the model in [`../stories/`](../stories/).
- **Jenkins → GitHub Actions runners.** Test scripts run through workflow action files
  instead of Jenkins.

With those replaced, the **last remaining piece is AI QA Studio**: the visual dashboard
and studio over this GitHub-native, AI-driven pipeline.

## Guidelines

Goals the product holds to — not a spec. The *how* is worked out in GitHub issues.

- **Web GUI dashboard** — a visual studio for QA activities, not an IDE with prompts in
  it. It reads the markdown source of truth and surfaces the project's status —
  dev-story implementation, test plans, execution, and whatever else matters — so the
  Dev → QA → PM loop is visible in one place. (Illustrative, not a fixed set or order.)
- **Local markdown files as the source of truth** — stories and documents live as files
  in the repo.
- **AI-agent-driven documents** — the agent produces and drives the documents through
  the pipeline.
- **Execution via MCP** — local MCP servers (test management, browser, lab hardware)
  supply the tools; this is why parts stay **local-first**. GitHub-native and local-first
  coexist: files and CI live on GitHub, while the runners that touch local tools are
  self-hosted.

## Scope

- These are **goals, not specs.** Implementation — and its history — lives in GitHub
  issues. See [`../stories/`](../stories/).
- **Open, revisit later:** how the bound repos relate once this is proven — backport the
  solved pieces into `ai-qa-workflow` + `test-framework-template`, or make this repo the
  upstream they consume. Too early to decide.
