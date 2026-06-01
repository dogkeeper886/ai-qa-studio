# Architecture

## Principle: rewrap, don't rewrite

The methodology is portable. The skills (`.claude/skills/*/SKILL.md`) and commands are prompt/instruction assets. The product is a **new shell around the same brain** — a new UI and a local agent runtime that loads those same assets.

## Layers

```
┌─────────────────────────────────────────────┐
│  Frontend — the product face                 │
│  Web GUI (wizards / dashboards / live view)  │
└───────────────┬─────────────────────────────┘
                │  HTTP/REST (PM data)  +  WebSocket (live agent events)
┌───────────────▼─────────────────────────────┐
│  Agent-protocol hub  (local backend process) │
│  • AI agent runtime  → Claude Agent SDK      │
│  • loads the existing skills / commands       │
│  • orchestrates the gated workflow            │
└───────────────┬─────────────────────────────┘
                │  MCP
┌───────────────▼─────────────────────────────┐
│  MCP servers (local) — supplied by a profile │
│  test-management · issue tracker · browser · │
│  + any target-specific servers               │
└───────────────┬─────────────────────────────┘
                │
        Files / git  (state & review layer)  +  any local hardware
```

## The local-bound constraint

This is the reason the product is local-first. It holds regardless of UI choices.

| Phase | Cloud-able? | Why |
|-------|-------------|-----|
| Trace, plan, author, review gates, issue-tracker / test-management sync | ✅ Yes | Document-centric, API-driven |
| **Execution**: a real browser, local hardware, databases behind a private network | ❌ No | Needs local access the cloud can't reach |

A future cloud offering would still need a **local runner** for the execution half.

## Where process orchestration lives

All command/process execution — spawning MCP servers, running bash (`git`, test runners, …), streaming output — lives in the **hub** (the Claude Agent SDK), **not** in the desktop shell. This keeps the shell a thin, swappable window.

## Components & tech choices

| Layer | Choice | Notes / status |
|-------|--------|----------------|
| Frontend | Web GUI | Framework TBD (React likely) |
| Desktop shell | **Tauri** | Thin window; launches the hub via a Tauri **sidecar**. Lean/distributable — fits the open-source goal |
| Agent runtime ("hub") | **Claude Agent SDK (TypeScript)** | Same engine under Claude Code — existing skills drop in; handles tool loop, subagents, MCP. **Owns all process orchestration** |
| Shell ↔ hub transport | **HTTP/REST + WebSocket** | HTTP for PM data/forms; WebSocket carries the live agent session as a **pass-through of the SDK's native events** |
| Tools | **MCP servers**, supplied per profile | A generic profile uses portable servers (browser, issue tracker, test management); a target profile adds its own |
| State | Files + git | Reuse the existing review/audit layer; GUI renders it |

## Target-agnostic core + profiles

The **generic workflow engine** (gates, pipeline, GUI, agent runtime) knows nothing about any one system under test. A **profile** supplies the target-specific assets — navigation maps, vendor MCP servers, terminology, templates. The core depends on the *profile interface*, never on a specific profile. See [03_Profiles_and_Relationship.md](03_Profiles_and_Relationship.md).

## Open questions

- How the GUI represents the gated review steps (the review gates) — approve/iterate UX.
- The exact shape of the profile interface (what a profile must provide vs. may override).
