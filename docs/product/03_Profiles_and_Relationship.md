# Relationship, Profiles & the Backport Model

## The three repos

- **`ai-qa-workflow`** — the methodology (skills, commands, framework docs). The shipping source of truth for the workflow. Couples, in places, to proprietary tools (Jira/Confluence via `mcp-atlassian`).
- **`ai-qa-studio`** (this repo) — the generic, open-source *product* shell **and the proving ground** where we solve `ai-qa-workflow`'s problems in a target-agnostic, open-source-friendly way.
- **`r1-qa-studio`** — the RUCKUS One build of the same idea; consumes this core and adds an R1 profile.

## Why a separate proving ground

`ai-qa-workflow` has accumulated **dependencies on proprietary systems** that block an open-source release — the first being **Jira** in the trace step (see [problems/01_jira_coupling.md](problems/01_jira_coupling.md)). Fixing these in-place risks destabilising the shipping workflow. So we solve them here, against a clean target-agnostic design, then **backport the validated solution** to `ai-qa-workflow`.

```
problem found in ai-qa-workflow
        │
        ▼
solved generically here (ai-qa-studio)  ──►  proven via the studio
        │
        ▼
backported to ai-qa-workflow  (proprietary tool becomes one adapter, not the dependency)
```

## Target-agnostic core + adapters/profiles

The mechanism for every backport is the same: replace a hard dependency with an **interface + adapters**.

| Layer | Examples | Open source? |
|-------|----------|--------------|
| **Generic core** | workflow engine, gated pipeline, web GUI, agent runtime, the *source/target interfaces* | ✅ Yes |
| **Adapters / profiles** | a Jira intake adapter, a GitHub Issues adapter, a vendor navigation map, vendor MCP servers | Per adapter — OSS ones public, proprietary ones a private plugin |
| **Private only** | credentials, integration config (`config/`), customer data (`active/` / `completed/` deliverables) | ❌ Never |

## Mechanics

- `config/` is gitignored — keep all secrets and integration config there.
- **License:** TBD (Apache-2.0 or MIT are the candidates).
- Keep proprietary-tool strings out of the core so swapping an adapter is mechanical.

## Problem log

Solved/in-progress problems live in [`docs/product/problems/`](problems/). Newest design decisions also land in [04_Decision_Log.md](04_Decision_Log.md).
