# Initialize GitHub Tracking for a QA Project

```
Set up GitHub milestone and labels to track QA artifact changes for a Jira ticket.

Jira Ticket: {{input}}

## PURPOSE

Creates a GitHub milestone and ensures standard labels exist so all QA work
(test plans, test cases, reviews, syncs) is tracked with full change history.

---

## WORKFLOW

```
/gh-init PROJ-12345
    │
    ├─► Step 1: Verify GitHub Access
    │   - Run: gh auth status
    │   - Run: gh repo view --json name,owner
    │   - Confirm we are in a GitHub-backed repository
    │
    ├─► Step 2: Create Labels (idempotent)
    │   - Create labels if they do not already exist:
    │     • qa:plan       (color: #1d76db) — Test plan changes
    │     • qa:case       (color: #0e8a16) — Test case changes
    │     • qa:review     (color: #e4e669) — Review feedback
    │     • qa:sync       (color: #d93f0b) — TestLink sync
    │     • qa:execute    (color: #c5def5) — Test execution
    │     • priority:high (color: #b60205) — High priority
    │     • priority:med  (color: #fbca04) — Medium priority
    │     • priority:low  (color: #0e8a16) — Low priority
    │   - Use: gh label create "<name>" --color "<hex>" --description "<desc>" --force
    │
    ├─► Step 3: Create Milestone
    │   - Title: "PROJ-12345 — [Short Description from Jira ticket]"
    │   - Description: "QA tracking for Jira ticket PROJ-12345. Requirement source: [Jira URL]"
    │   - Use: gh api repos/{owner}/{repo}/milestones --method POST
    │   - If milestone with same title exists, skip creation and use existing
    │
    ├─► Step 4: Backfill Labels on Existing Issues
    │   - Search for open issues whose title contains the ticket ID:
    │     gh issue list --state open --search "PROJ-12345" --json number,title
    │   - For each matching issue that lacks the ticket label, apply it:
    │     gh issue edit <number> --add-label "PROJ-12345"
    │   - Report how many issues were backfilled
    │
    └─► Step 5: Report
        - Print label summary (including backfill count)
        - Print next step: "Run /gh-track to create tracking issues"
```

---

## EXAMPLE

```bash
/gh-init PROJ-12345
```

**Output:**
```
GitHub tracking initialized for PROJ-12345

Milestone: #3 "PROJ-12345 — User Session Management"
URL: https://github.com/owner/repo/milestone/3

Labels verified: qa:plan, qa:case, qa:review, qa:sync, qa:execute

Next: Use /gh-track to create tracking issues under this milestone.
```

---

## API Notes

- Uses `gh` CLI (GitHub CLI) — must be authenticated
- Labels use `--force` flag so existing labels are updated, not duplicated
- Milestone creation checks for existing milestone with same title first
- Jira URL format: https://your-domain.atlassian.net/browse/PROJ-12345
```
