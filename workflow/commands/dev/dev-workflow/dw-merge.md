# Merge a Pull Request

```
Merge an approved pull request and clean up.

PR number: {{input}}

## PURPOSE

Merges an approved PR, deletes the remote branch, cleans up local branches
and issue labels. The linked issue auto-closes via "Fixes #N" in the PR body.

---

## WORKFLOW

    /dw-merge 30
        │
        ├─► Step 1: Verify PR is Ready
        │   - Run: gh pr view <PR> --json reviewDecision,mergeStateStatus,headRefName
        │   - Must be approved and mergeable
        │   - Run: gh pr checks <PR>
        │   - CI checks must pass (if applicable)
        │
        ├─► Step 2: Identify Linked Issue and Story
        │   - Read PR body for "Fixes #N" or "Closes #N"
        │   - Note the issue number for label cleanup
        │   - Check if PR body or issue title contains [STORY-XXX] or "Part of STORY-XXX"
        │
        ├─► Step 3: Merge
        │   - Run: gh pr merge <PR> --merge --delete-branch
        │   - Uses --merge (not squash/rebase) to preserve commit history
        │   - --delete-branch cleans up the remote branch
        │
        ├─► Step 4: Clean Up Issue Labels
        │   - Run: gh issue edit <N> --remove-label "status:needs-review"
        │   - Issue auto-closes via "Fixes #N" — no manual close needed
        │
        ├─► Step 5: Update Story File (if linked)
        │   - If linked to STORY-XXX and docs/stories/STORY-XXX.md exists:
        │     • Check off completed acceptance criteria for this task
        │     • If all story tasks are closed, mark story status as Completed
        │   - Skip silently if no story link or docs/stories/ doesn't exist
        │
        ├─► Step 6: Clean Up Local Branch
        │   - Run: git checkout main && git pull
        │   - Run: git branch -d <branch-name>
        │
        └─► Step 7: Report
            - Confirm merge to the user
            - Show the merged PR URL
            - If story has remaining open tasks, suggest: /dw-implement <next-issue>
            - If story is complete, mention it
            - Mention any follow-up issues if applicable

---

## EXAMPLE

    /dw-merge 30

**Agent verifies, merges, cleans up:**

    $ gh pr view 30 --json reviewDecision,mergeStateStatus,headRefName
    $ gh pr checks 30
    $ gh pr merge 30 --merge --delete-branch
    $ gh issue edit 27 --remove-label "status:needs-review"
    $ git checkout main && git pull
    $ git branch -d issue-27-release-notes

**Output:**

    PR #30 merged: https://github.com/owner/repo/pull/30
    Issue #27 auto-closed.
    Branch issue-27-release-notes deleted (local + remote).

---

## API Notes

- Uses `gh` CLI for PR and issue operations
- `--merge` preserves full commit history (use `--squash` only if the project convention requires it)
- `--delete-branch` removes the remote branch; `git branch -d` removes the local one
- If PR is not approved or CI fails, report the blocker instead of merging
```
