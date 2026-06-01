# GitHub QA Tracking Status

```
Show open tracking issues and pending tasks for a QA project.

Milestone or Ticket: {{input}}

## PURPOSE

Lists all GitHub issues under a milestone, showing what QA work is done and
what remains. Gives the agent session-start context to resume work.

---

## WORKFLOW

    /gh-status PROJ-12345
        │
        ├─► Step 1: Find Milestone
        │   - Search milestones matching the ticket ID
        │   - Use: gh api repos/{owner}/{repo}/milestones --jq '.[] | select(.title | contains("PROJ-12345"))'
        │   - If not found: "No milestone found. Run /gh-init PROJ-12345 first."
        │
        ├─► Step 2: List Issues
        │   - Fetch all issues (open + closed) under the milestone
        │   - Use: gh issue list --milestone "<title>" --state all --json number,title,state,labels,body
        │
        ├─► Step 3: Parse Open Tasks
        │   - For each open issue, count checked vs unchecked tasks in body
        │   - Extract unchecked items (lines matching "- [ ]")
        │
        └─► Step 4: Report
            - Print summary table
            - Print open tasks list
            - Suggest next action

---

## OUTPUT FORMAT

    ## QA Tracking Status: PROJ-12345 — User Session Management

    ### Summary
    | # | Title | Labels | Tasks | Status |
    |---|-------|--------|-------|--------|
    | #8 | Create test plan | qa:plan | 4/4 | ✅ Closed |
    | #10 | Design test cases | qa:case | 6/6 | ✅ Closed |
    | #12 | Review feedback: TS-02, TS-04 | qa:review | 2/4 | 🔴 Open |
    | #15 | Sync to TestLink | qa:sync | 0/4 | 🔴 Open |

    ### Open Tasks

    **#12 — Review feedback: TS-02, TS-04** (2 remaining)
    - [ ] Clarify TS-03 scope — confirm with PM if bulk upload included
    - [ ] Rewrite TS-02 steps 3-5 (API changed from XML to JSON)

    **#15 — Sync to TestLink** (4 remaining)
    - [ ] Create/update test suites
    - [ ] Sync test cases (diff: skip/update/create)
    - [ ] Create test plan and assign cases
    - [ ] Verify count matches local

    ### Suggested Next Action
    Pick up issue #12 — 2 tasks remaining from PM review feedback.

---

## EXAMPLE

    /gh-status PROJ-12345

---

## USE CASES

### Session Start
Run at the beginning of a new session to see where you left off:

    /gh-status PROJ-12345

The agent reads open tasks and resumes work without asking the user.

### Progress Check
Run mid-session to see how much work remains:

    /gh-status PROJ-12345

### Milestone Completion
When all issues are closed, the milestone can be closed:

    gh api repos/{owner}/{repo}/milestones/{number} --method PATCH -f state=closed

---

## API Notes

- Uses `gh` CLI (GitHub CLI)
- Parses task lists from issue bodies (GitHub-flavored markdown checkboxes)
- Shows both open and closed issues for complete picture
- Milestone search is case-insensitive substring match on ticket ID
```
