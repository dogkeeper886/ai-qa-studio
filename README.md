# AI QA Studio

> Working name — easily renamed.

A **local-first**, **web-GUI** product that runs the [`ai-qa-workflow`](https://github.com/dogkeeper886/ai-qa-workflow) AI QA methodology as an **AI-driven framework that closes the Dev → QA → PM loop** — markdown files are the source of truth, and a dashboard surfaces project status (dev-story implementation, test plans, execution).

**Status:** Planning / documentation. No application code yet.

## Why this exists

- The `ai-qa-workflow` toolkit (slash commands + agent skills + MCP) works, but its delivery face is **Claude Code — a general-purpose coding IDE**. That works for engineers but isn't a *product* a non-developer QA team or leadership recognises as one.
- A full cloud SaaS is rejected as the *starting point* because parts of the workflow depend on **MCP integrations that must run locally** (a real browser via Playwright, lab hardware, SQL behind a private network). A hosted backend can't reach those. → **Start local.**

This is the **target-agnostic, open-source studio**. The RUCKUS One build, [`r1-qa-studio`](https://github.com/dogkeeper886/r1-qa-studio), is the same idea bound to one target; the generic core it describes (its D5 / Open-Source Plan) is *this* repo.

## Repo layout

```
ai-qa-studio/
├── docs/product/        # the product vision — the overall view (goals, not specs)
├── docs/stories/        # feature requests as goals (the how lives in GitHub issues)
├── docs/methodology/    # the original ai-qa-workflow CLAUDE.md / README, preserved
├── .claude/skills/      # QA lifecycle skills — the agent's brain (copied from ai-qa-workflow)
├── .claude/commands/    # slash commands (copied from ai-qa-workflow)
├── scripts/             # helper scripts
├── active/  completed/  # the workspace structure the product GENERATES (empty placeholders here)
└── config/              # local-only secrets / integration config (gitignored)
```

## Start here

| Doc | What |
|-----|------|
| [00 Vision & Scope](docs/product/00_Vision_and_Scope.md) | The vision, the repos it binds, the problem, guidelines, scope |

## Relationship to `ai-qa-workflow` and `r1-qa-studio`

- **`ai-qa-workflow`** — the methodology (skills, commands, framework docs). Source of truth for the workflow; copied here as the product's embedded knowledge.
- **`ai-qa-studio`** (this repo) — the product that binds the methodology and the test framework ([`test-framework-template`](https://github.com/dogkeeper886/test-framework-template)) into one AI-driven loop, with a dashboard over markdown as the source of truth.
- **`r1-qa-studio`** — the RUCKUS One build of the same idea; consumes this core as its target-agnostic base and adds an R1 profile (R1 navigation map, R1 MCP servers, R1 terminology).
