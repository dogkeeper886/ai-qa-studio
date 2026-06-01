# Close GitHub Tracking Issue

```
Close a GitHub tracking issue with a summary of completed work.

Issue Number: {{input}}

## PURPOSE

Closes a QA tracking issue after all tasks are complete. Adds a summary
comment documenting what was done, linking to the PR if applicable.

---

## WORKFLOW

    /gh-close 12
        │
        ├─► Step 1: Verify Completion
        │   - Fetch issue body: gh issue view <number> --json body,title,labels
        │   - Parse task list: count checked vs unchecked
        │   - If unchecked tasks remain:
        │     • Warn: "Issue #12 has 2 unchecked tasks. Close anyway? (y/n)"
        │     • If user says no, stop
        │     • If user says yes, proceed (partial completion)
        │
        ├─► Step 2: Generate Summary Comment
        │   - List completed tasks
        │   - List skipped/deferred tasks (if any)
        │   - Reference PR number if current branch has a PR
        │   - Note artifacts created or modified
        │
        ├─► Step 3: Close Issue
        │   - Add summary comment: gh issue comment <number> --body "<summary>"
        │   - Close: gh issue close <number>
        │   - If a PR exists that addresses this issue, prefer closing via
        │     "Fixes #N" in the PR description instead
        │
        └─► Step 4: Report
            - Print closed issue number and URL
            - Print summary of completed work
            - Suggest next action (next open issue from /gh-status)

---

## SUMMARY COMMENT TEMPLATE

    ## Completed

    - [x] Task 1 description
    - [x] Task 2 description
    - [x] Task 3 description

    ## Deferred
    <!-- Only if there are unchecked tasks -->
    - [ ] Task 4 — deferred: waiting on PM confirmation

    ## Artifacts Modified
    - `test_plan/sections/04_Test_Strategy.md`
    - `test_cases/TS-02_Session_Validation.md`
    - `test_cases/TS-04_Timeout_Edge_Case.md` (new)

    ## PR
    Closes via PR #14

---

## EXAMPLES

### Example 1: All tasks complete

    /gh-close 12

**Output:**

    Issue #12 closed: "Review feedback: rewrite TS-02, add TS-04"
    All 4/4 tasks completed.
    Artifacts: TS-02 updated, TS-04 created, TS-01 precondition fixed, TS-03 scope clarified.
    Next open issue: #15 "Sync to TestLink" (4 tasks)

### Example 2: Partial completion

    /gh-close 12

**Output:**

    ⚠ Issue #12 has 1 unchecked task:
      - [ ] Clarify TS-03 scope — confirm with PM if bulk upload included

    Close anyway? (y/n)

    > y

    Issue #12 closed with 3/4 tasks completed.
    Deferred: TS-03 scope clarification (waiting on PM).

### Example 3: Close via PR

If you have a branch with changes for this issue, include "Fixes #12" in the PR description. The issue will auto-close when the PR merges.

    gh pr create --title "[QA] Address review feedback for PROJ-12345" \
      --body "Fixes #12" --milestone "PROJ-12345 — User Session Management"

---

## API Notes

- Uses `gh` CLI (GitHub CLI)
- Prefer closing via PR "Fixes #N" for automatic traceability
- Summary comment provides a final record of what was done
- Deferred tasks should be tracked in a new issue if follow-up is needed
```
