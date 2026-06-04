# CLAUDE.md — AI QA Studio

## What this repo is

The **AI QA Studio product** — the local-first web GUI / dashboard face for an **AI-driven QA framework that closes the Dev → QA → PM loop**. It binds `ai-qa-workflow` (the QA methodology) and `test-framework-template` (the test scripts) into one product; **markdown files are the source of truth**, and the dashboard surfaces project status (dev-story implementation, test plans, execution). This is **not** the `ai-qa-workflow` repo — it is the product built *around* that methodology. It is the **target-agnostic, open-source core**; the RUCKUS One build, `r1-qa-studio`, is built on top of it. Currently in the **documentation phase — no application code yet.**

## Where the methodology came from

`.claude/skills/` + `.claude/commands/` hold the methodology — originally derived from `ai-qa-workflow` as the product's embedded knowledge, now the product's own **committed source of truth**. The original repo's `CLAUDE.md` and `README.md` are preserved under `docs/methodology/`. These are **reference assets the product will run**, not live test deliverables.

## Working here

- The product vision and scope live in `docs/product/00_Vision_and_Scope.md`. Read it before proposing architecture changes. These docs are **goals, not specs** — the *how* (and its history) belongs in GitHub issues.
- Keep the **core target-agnostic.** Anything specific to one target (a vendor's navigation map, vendor MCP servers, vendor terminology) belongs in a **profile**, not the core.
- **One committed workflow surface.** `.claude/commands/` and `.claude/skills/` are the single source of truth the backend loads directly — committed, no separate source dir, no build/sync step. The thing you edit is the thing that runs. Only `.claude/settings.local.json` stays local (gitignored).
- **Skill vs. command — the standing rule.** A unit is a **skill** only if it needs a `references/` folder (progressive disclosure) **or** genuine **auto-invocation** (the agent fires it by intent) / **tool-gating** (`tools:` allow-list). Everything else is a **command**. Commands are the default home and **carry the grouping** — foldered into purpose namespaces (`.claude/commands/<group>/<name>.md` → `/<group>:<name>`), browseable and discoverable. **Skills are flat-only** (`.claude/skills/<name>/SKILL.md` — Claude Code discovers skills one level deep; a foldered skill is invisible). **No name collisions** — skill↔command or skill↔skill; one `/name` means one thing.
- **Review pairing — standing rule.** Every **producer** — a unit that creates, syncs, publishes, or drafts a deliverable — has a **paired review** that checks the result is complete, added in the *same change* as the producer. Don't ship a producer without its review. The `reviewing-artifacts` audit enforces this: it runs a coverage pass that **names any producer with no paired review**.
- Secrets, integration config, and customer data go **only** in `config/` (gitignored). Never commit them.

## Conventions

- **Small changes** commit to `master`; **large changes** use a feature branch + PR.
- This repo's git history starts at the scaffold commit. Remote `origin` is `github.com/dogkeeper886/ai-qa-studio` (don't push without being asked).
