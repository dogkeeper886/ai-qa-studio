# CLAUDE.md — AI QA Studio

## What this repo is

The **AI QA Studio product** — a local-first desktop app (web GUI) that runs the AI QA workflow as a product. This is **not** the `ai-qa-workflow` repo; it is the application being built *around* that workflow. This is the **target-agnostic, open-source core**; the RUCKUS One build, `r1-qa-studio`, is a profile on top of it. Currently in the **documentation phase — no application code yet.**

## Where the methodology came from

`.claude/skills/` and `.claude/commands/` were copied from `ai-qa-workflow` as the product's embedded knowledge. The original repo's `CLAUDE.md` and `README.md` are preserved under `docs/methodology/`. These copied skills are **reference assets the product will run**, not live test deliverables.

## Working here

- Founding decisions and scope live in `docs/product/`. Read those before proposing architecture changes; record new decisions in `docs/product/04_Decision_Log.md`.
- Keep the **core target-agnostic.** Anything specific to one target (a vendor's navigation map, vendor MCP servers, vendor terminology) belongs in a **profile**, not the core — see `docs/product/03_Profiles_and_Relationship.md`.
- Secrets, integration config, and customer data go **only** in `config/` (gitignored). Never commit them.

## Conventions

- **Small changes** commit to `master`; **large changes** use a feature branch + PR.
- This repo's git history starts at the scaffold commit. Remote `origin` is `github.com/dogkeeper886/ai-qa-studio` (don't push without being asked).
