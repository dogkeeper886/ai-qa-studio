# MVP — Limited Function First

## Goal

Prove the product with the slice that needs **no local hardware**: the document pipeline. It demonstrates the whole "AI does the QA work" story while sidestepping the hard execution parts.

## The slice

```
ticket → trace → plan → cases → review gates
```

…rendered live in the web GUI, output saved to the workspace (files + git).

## User flow

1. User enters a ticket ID (or pastes ticket text for an offline demo).
2. Agent traces the ticket + related docs (MCP: issue tracker / docs).
3. Agent produces a **test plan**; the GUI shows it alongside the **first completeness review gate**.
4. Agent produces **test cases**; the GUI shows them alongside the **second review gate**.
5. Output is written to the workspace; user can view, iterate, and export.

## Demo acceptance

- Looks and feels like a **product**, not an IDE.
- **One input → reviewed plan + cases**, visibly AI-driven, with the review gates surfaced.
- Runs **locally**; this slice needs no local hardware.
- Works against a **generic profile** — nothing in the MVP assumes any one target system.

## Deferred to later

- Execution phases that need local hardware in the GUI.
- Write-back to external test-management systems.
- Multi-user, hosted, cloud.
- A published-render review gate — depends on a publish target.
