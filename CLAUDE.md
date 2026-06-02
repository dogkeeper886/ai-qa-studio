# CLAUDE.md — AI QA Studio

## What this repo is

The **AI QA Studio product** — the local-first web GUI / dashboard face for an **AI-driven QA framework that closes the Dev → QA → PM loop**. It binds `ai-qa-workflow` (the QA methodology) and `test-framework-template` (the test scripts) into one product; **markdown files are the source of truth**, and the dashboard surfaces project status (dev-story implementation, test plans, execution). This is **not** the `ai-qa-workflow` repo — it is the product built *around* that methodology. It is the **target-agnostic, open-source core**; the RUCKUS One build, `r1-qa-studio`, is built on top of it. Currently in the **documentation phase — no application code yet.**

## Where the methodology came from

`workflow/` holds the methodology (`workflow/skills/` + `workflow/commands/`) copied from `ai-qa-workflow` as the product's embedded knowledge — it is the **source of truth**. The original repo's `CLAUDE.md` and `README.md` are preserved under `docs/methodology/`. These are **reference assets the product will run**, not live test deliverables.

## Working here

- The product vision and scope live in `docs/product/00_Vision_and_Scope.md`. Read it before proposing architecture changes. These docs are **goals, not specs** — the *how* (and its history) belongs in GitHub issues.
- Keep the **core target-agnostic.** Anything specific to one target (a vendor's navigation map, vendor MCP servers, vendor terminology) belongs in a **profile**, not the core.
- **Run-surface convention.** `workflow/` is the committed source of truth. To *run* a command or skill, link (or copy) it into `.claude/commands/` or `.claude/skills/` on demand — those dirs are **gitignored**, so there's only ever one committed copy and nothing to keep in sync.
- Secrets, integration config, and customer data go **only** in `config/` (gitignored). Never commit them.

## Conventions

- **Small changes** commit to `master`; **large changes** use a feature branch + PR.
- This repo's git history starts at the scaffold commit. Remote `origin` is `github.com/dogkeeper886/ai-qa-studio` (don't push without being asked).
