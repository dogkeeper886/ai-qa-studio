# AI QA Studio — Vision & Scope

## Problem

The `ai-qa-workflow` methodology is delivered through **Claude Code, a general-purpose coding IDE**, plus `.claude/skills` and `.claude/commands`. It works, but it looks and feels like a developer tool, not a product. A non-developer QA team — or leadership evaluating it — doesn't see a product; they see an IDE with prompts in it.

A full cloud SaaS is rejected as the *starting point*: parts of the workflow depend on **MCP integrations that must run locally** — a real browser (Playwright), lab hardware, databases behind a private network. A hosted backend cannot reach those.

## Vision

**AI QA Studio** is a **local-first desktop application** with a **web GUI** that runs the AI QA workflow as a product. A QA engineer points it at a ticket and watches it produce a reviewed test plan and test cases, with the integrations the workflow needs available locally.

It is **target-agnostic**: the methodology is general, and any specific system under test (a vendor platform, an internal app) is supplied as a pluggable **profile**, not baked into the core.

## Principles

1. **Local-first.** Ship as a local app so the integrations that need local access work. Cloud features come later, additively — not as a rewrite.
2. **Reuse the methodology, replace the shell.** The skills/commands are portable prompt assets; the product is a new UI + runtime around the same brain. Don't rewrite the methodology.
3. **Learn from products, adopt none.** Study existing tools for UX and architecture patterns; don't build *on* an off-the-shelf product — a net-new product won't get the fit it needs from one.
4. **Target-agnostic core, profiles at the edge.** The workflow engine, GUI, and agent runtime know nothing about any one system under test. Vendor-specific assets (navigation maps, vendor MCP servers, terminology) live in a separable profile; secrets and customer data live in a private layer.

## In scope (v1)

- Web GUI product face.
- Local agent runtime executing the **document pipeline**: ticket → trace → plan → cases → review gates.
- Reuse of the existing `ai-qa-workflow` skills/commands as the agent's knowledge.

## Runtime cost

AI QA Studio is a **third-party Agent SDK app**. Per Anthropic's 2026-05-13 policy (effective 2026-06-15), runtime LLM calls draw from the user's **Agent SDK credit pool** ($20 Pro / $100 Max 5x / $200 Max 20x) — a separate meter on the same Claude plan as interactive Claude Code, not from interactive subscription limits. Users can alternatively paste an `ANTHROPIC_API_KEY` for pay-as-you-go billing. The product is **editor-agnostic** (a desktop app, not an IDE plugin) — the same auth modes work for users on any editor or none. Decision: [D19 in 04](04_Decision_Log.md).

## Out of scope (v1 — deferred)

- Execution phases that need local hardware surfaced in the GUI.
- Multi-user / hosted / cloud.
- Write-back automation to external test-management systems (read or sync may arrive earlier).
- Any target-specific profile shipped in this core repo (profiles are separate — see [03](03_Profiles_and_Relationship.md)).
