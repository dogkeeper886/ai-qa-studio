## AI QA Workflow

This section provides AI coding agents with QA workflow guidance powered by MCP integrations.

### Skills

Skills are loaded on demand. Use the matching skill when the trigger condition applies.

| Skill | Trigger Condition |
|-------|-------------------|
| `receiving-tickets` | When given a Jira ticket ID to investigate or start a new QA project |
| `planning-tests` | When requirements are gathered and a test plan is needed |
| `designing-cases` | When a test plan exists and detailed test cases need to be written |
| `drafting-review-email` | When test artifacts are ready for stakeholder review |
| `syncing-testlink` | When test cases need to be imported into TestLink |
| `executing-tests` | When a TestLink test plan is ready for browser-based execution |
| `creating-demo` | When a demo presentation needs to be created from test results |
| `analyzing-logs` | When Robot Framework logs need failure analysis |
| `tracking-changes` | When QA artifacts are created, modified, or reviewed — track in GitHub |

### Test Lifecycle

| Phase | Skill | Key Commands |
|-------|-------|--------------|
| Discover | `receiving-tickets` | `/jr-trace` |
| Plan | `planning-tests` | `/tw-plan-init` → `/tw-plan-feature\|enhance\|bugfix` |
| Design | `designing-cases` | `/tw-case-init` → `/tw-case-feature\|enhance\|bugfix` |
| Manage | `syncing-testlink` | `/tl-create-suite`, `/tl-create-case`, `/tl-create-plan` |
| Execute | `executing-tests` | `/tl-execute-case`, `/tl-create-execution` |
| Track | `tracking-changes` | `/gh-init`, `/gh-track`, `/gh-status`, `/gh-close` |

### Change Tracking

Track QA artifact changes in GitHub for provenance and session recovery:

```
/gh-init PROJ-12345        # Create milestone + labels (once per ticket)
/gh-track "description"    # Create tracking issue with checklist
/gh-status PROJ-12345      # Show open work (use at session start)
/gh-close 12               # Close completed issue
```

### MCP Dependencies

These MCP servers must be configured:
- **mcp-atlassian** — Jira/Confluence access
- **testlink-mcp** — TestLink API access
- **playwright-mcp** — Browser automation (optional)

### Available Commands

**GitHub (gh-*):** `/gh-init`, `/gh-track`, `/gh-status`, `/gh-close`

**Jira (jr-*):** `/jr-trace`, `/jr-trace-fetch`, `/jr-trace-structure`, `/jr-trace-docs`, `/jr-trace-verify`

**Confluence (cf-*):** `/cf-create-page`, `/cf-update-page`, `/cf-review-page`, `/cf-format-guide`

**Test Workflow (tw-*):** `/tw-plan-init`, `/tw-plan-feature`, `/tw-plan-enhance`, `/tw-plan-bugfix`, `/tw-plan-review`, `/tw-diagrams`, `/tw-case-init`, `/tw-case-feature`, `/tw-case-enhance`, `/tw-case-bugfix`, `/tw-case-review`, `/tw-templates`, `/tw-script-review`

**TestLink (tl-*):** `/tl-list-projects`, `/tl-create-suite`, `/tl-list-suites`, `/tl-update-suite`, `/tl-create-case`, `/tl-get-case`, `/tl-list-cases`, `/tl-update-case`, `/tl-identify-type`, `/tl-create-plan`, `/tl-get-cases-for-plan`, `/tl-add-case-to-plan`, `/tl-execute-case`, `/tl-read-execution`, `/tl-create-execution`, `/tl-format`, `/tl-sync`, `/tl-list-requirements`

**Project (pm-*):** `/pm-init`, `/pm-demo-content`, `/pm-demo-review`, `/pm-demo-ppt`, `/pm-demo-email`, `/pm-meeting-invite`, `/pm-bug-report`

**Utility:** `/rewrite-text`, `/robot-log-analyzer`
