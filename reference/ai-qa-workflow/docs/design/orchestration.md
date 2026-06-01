# Orchestration Pattern

Commands use a **detect-and-route** pattern: a short entry-point command reads the project context, classifies it, and routes to the right specialist command. Each command ends with a "Next step" hint so the agent always knows what to do next.

## Orchestration Styles

| Style | Entry Point | How It Works |
|-------|-------------|--------------|
| **Sequential Pipeline** | `/jr-trace` | Chains through fetch → structure → docs in a fixed order |
| **Fan-out Router** | `/tw-plan-init` | Detects type (feature/enhance/bugfix) and routes to one specialist |
| **Smart Diff** | `/tl-sync` | Compares local files against TestLink, applies only the changes |

## End-to-End Flow

**Using skills (recommended):**
```
/receiving-tickets → /planning-tests → /designing-cases → /syncing-testlink → /executing-tests
                                              │
                                   /drafting-review-email
```

**Using commands (granular):**
```
/jr-trace → /tw-plan-init → /tw-plan-review → /tw-case-init → /tw-case-review → /tl-sync
  │              │                                   │
  ├─ fetch       ├─ feature                          ├─ feature
  ├─ structure   ├─ enhance                          ├─ enhance
  ├─ docs        └─ bugfix                           └─ bugfix
  └─ verify
```
