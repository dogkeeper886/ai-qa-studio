# Create GitHub Tracking Issue

```
Create a GitHub issue to track a QA artifact change with checklist and provenance.

Task Description: {{input}}

## PURPOSE

Creates a GitHub issue under a milestone to track a specific QA activity
(test plan creation, test case design, review feedback, TestLink sync).
Each issue captures what changed, why, and what tasks remain.

---

## WORKFLOW

    /gh-track "Create test plan for PROJ-12345"
        │
        ├─► Step 1: Determine Context
        │   - Identify the milestone (from project folder name or user input)
        │   - Detect activity type from context:
        │     • Creating/updating test plan → label: qa:plan
        │     • Creating/updating test cases → label: qa:case
        │     • Review feedback or change request → label: qa:review
        │     • Syncing to TestLink → label: qa:sync
        │     • Executing tests → label: qa:execute
        │   - Detect priority (default: priority:med)
        │
        ├─► Step 2: Build Issue Body
        │   - Source: where this work comes from (Jira ticket, review, PR, conversation)
        │   - Rationale: why this change is needed
        │   - Checklist: break work into checkable tasks
        │   - References: link to related issues, Jira tickets, Confluence pages
        │   - Use markdown template below
        │
        ├─► Step 3: Create Issue
        │   - Use: gh issue create --title "<title>" --body "<body>"
        │           --milestone "<milestone>" --label "<labels>"
        │   - Title format: "[QA] <action> for <ticket>"
        │     Examples:
        │     • "[QA] Create test plan for PROJ-12345"
        │     • "[QA] Review feedback: rewrite TS-02, add TS-04"
        │     • "[QA] Sync test cases to TestLink"
        │
        └─► Step 4: Report
            - Print issue number and URL
            - Print checklist summary (N tasks)

---

## ISSUE BODY TEMPLATE

    ## Source
    <!-- Where this work comes from -->
    - **Jira ticket**: PROJ-12345
    - **Trigger**: [e.g., "Initial test planning" / "PM review feedback" / "Code change in PR #42"]

    ## Rationale
    <!-- Why this change is needed -->
    [Brief explanation of why this work matters]

    ## Tasks
    <!-- Break into checkable items -->
    - [ ] Task 1 description
    - [ ] Task 2 description
    - [ ] Task 3 description

    ## References
    <!-- Related issues, docs, links -->
    - Jira: [PROJ-12345](https://your-domain.atlassian.net/browse/PROJ-12345)
    - Related: #N (if applicable)

    ## Artifacts
    <!-- Files created or modified -->
    - `test_plan/sections/04_Test_Strategy.md`
    - `test_cases/TS-02_Session_Validation.md`

---

## EXAMPLES

### Example 1: Track test plan creation

    /gh-track "Create test plan for PROJ-12345"

**Issue created:**

    #8: [QA] Create test plan for PROJ-12345
    Labels: qa:plan, priority:high
    Milestone: PROJ-12345 — User Session Management

    Tasks:
    - [ ] Detect ticket type (feature/bugfix/enhance)
    - [ ] Write test plan sections 01-06
    - [ ] Review coverage matrix
    - [ ] Publish to Confluence

### Example 2: Track review feedback

    /gh-track "PM review: rewrite TS-02, add TS-04, clarify TS-03 scope"

**Issue created:**

    #12: [QA] Review feedback: rewrite TS-02, add TS-04, clarify TS-03
    Labels: qa:review, priority:med
    Milestone: PROJ-12345 — User Session Management

    Tasks:
    - [ ] Rewrite TS-02 steps 3-5 (API changed from XML to JSON)
    - [ ] Add TS-04 timeout edge case for session renewal
    - [ ] Clarify TS-03 scope — confirm with PM if bulk upload included

### Example 3: Track TestLink sync

    /gh-track "Sync updated test cases to TestLink"

**Issue created:**

    #15: [QA] Sync test cases to TestLink for PROJ-12345
    Labels: qa:sync, priority:med
    Milestone: PROJ-12345 — User Session Management

    Tasks:
    - [ ] Create/update test suites
    - [ ] Sync test cases (diff: skip/update/create)
    - [ ] Create test plan and assign cases
    - [ ] Verify count matches local

---

## UPDATING TASK STATUS

When working through tasks, update the issue body checkboxes:
- Use: gh issue edit <number> --body "<updated body>"
- Or add a comment with progress: gh issue comment <number> --body "<update>"

When all tasks are complete, close the issue with `/gh-close`.

---

## API Notes

- Uses `gh` CLI (GitHub CLI)
- Milestone must exist first (run `/gh-init` if needed)
- Labels must exist (created by `/gh-init`)
- Issue title should be concise but descriptive
- Body uses GitHub-flavored markdown with task lists
```
