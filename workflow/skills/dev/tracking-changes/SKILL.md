---
name: tracking-changes
description: |
  Tracks QA artifact changes in GitHub using milestones, issues, and PRs.
  Use when starting a new QA project (to initialize tracking), when creating
  or modifying test plans or test cases, when receiving review feedback,
  when syncing to TestLink, or when resuming work in a new session.
disable-model-invocation: true
---

# tracking-changes

Tracks QA artifact changes in GitHub with full provenance: what changed, why, and what's still open.

## Progress Checklist

Copy and track your progress:

```
- [ ] Step 1: Initialize tracking (first time only)
- [ ] Step 2: Create tracking issue for current work
- [ ] Step 3: Work through tasks, update checkboxes
- [ ] Step 4: Close issue when tasks are complete
```

## When to Track

The agent should create or update tracking issues at these points:

| After This Skill/Command | Action |
|--------------------------|--------|
| `/receiving-tickets` | Run `/gh-init` to create milestone, then `/gh-track` to log project setup |
| `/planning-tests` | Run `/gh-track` to log test plan creation |
| `/designing-cases` | Run `/gh-track` to log test case design |
| Review feedback from user | Run `/gh-track` to capture feedback as checklist |
| `/syncing-testlink` | Run `/gh-track` to log TestLink sync |
| `/executing-tests` | Run `/gh-track` to log test execution |
| Test plan or test case edits | Run `/gh-track` to log what changed and why |
| Session start (resuming work) | Run `/gh-status` to see open tasks |

## Steps

### Step 1: Initialize Tracking (First Time Only)

Run `/gh-init` with the Jira ticket ID to create a GitHub milestone and ensure labels exist.

Skip if milestone already exists for this ticket.

### Step 2: Create Tracking Issue

Run `/gh-track` to create a GitHub issue under the milestone. The agent should:

1. **Detect the activity type** from context (plan, case, review, sync, execute)
2. **Write the source** — where this work comes from (Jira ticket, review, PR, conversation)
3. **Write the rationale** — why this change is needed
4. **Break into tasks** — checkable items for each piece of work
5. **List references** — related issues, Jira tickets, Confluence pages

### Step 3: Work Through Tasks

As the agent completes each task:

1. Update the issue body to check off completed items
2. Add comments for significant findings or decisions
3. If blocked, comment with details and move to next task

### Step 4: Close Issue

Run `/gh-close` when all tasks are complete (or when closing with deferred items).

If changes were committed, prefer closing via PR with "Fixes #N" in the description.

## Session Recovery

At the start of a new session, if the user is resuming work on an existing project:

1. Run `/gh-status` to see open issues and pending tasks
2. Pick up the first open issue or ask the user which to continue
3. Resume work from the unchecked tasks

## Expected Input

Jira ticket ID (for `/gh-init`) or task description (for `/gh-track`).

## Integration with Existing Skills

This skill does NOT replace any existing skill. It runs alongside them:

```
/receiving-tickets → creates project folder    (existing)
                   → /gh-init + /gh-track      (tracking layer)

/planning-tests    → creates test plan         (existing)
                   → /gh-track                 (tracking layer)

/designing-cases   → creates test cases        (existing)
                   → /gh-track                 (tracking layer)

Review feedback    → edits test plan/cases     (existing)
                   → /gh-track                 (tracking layer)

/syncing-testlink  → syncs to TestLink         (existing)
                   → /gh-track                 (tracking layer)
```
