---
name: git-merge-workflow
description: >
  Use this skill when applying or reviewing code changes that need to be merged.
  Handles the full workflow: pulling main, creating a working branch, handling
  issue-based fixes (including issue creation), implementing the change, and
  creating a pull request via GitHub CLI.
license: MIT
---

# Git Merge Workflow Skill

This skill guides the agent through the standard workflow for applying or reviewing code changes in a repository.

## Workflow Steps

### 1. Pull Latest Changes from Main

```bash
git checkout main
git pull origin main
```

Always start by ensuring the local `main` branch is up-to-date with the remote.

### 2. Create New Working Branch

```bash
git checkout -b <branch-name>
```

**Branch naming conventions:**
- For features: `feat(<section>)/<description>`
- For bug fixes: `fix(<section>)/<description>`
- For issues: `fix(<section>)/issue#number` (e.g., `fix(cli)/issue12`)

Keep branch names descriptive but concise (lowercase, hyphens as separators).

**Label usage:**
- Use appropriate labels for issues and PRs when applicable
- Common labels include: `bug`, `enhancement`, `documentation`, `question`, `help wanted`
- For issues, use labels to categorize and prioritize
- For PRs, use labels to indicate status and type of change

### 3. Check for Issue Fix

**Determine if this is an issue fix:**
- Ask the user or check the context to see if they're addressing a specific GitHub issue
- Look for issue numbers in the request (e.g., "#123", "issue #45")
- If the user mentions "fix", "bug", "problem", or references an issue, treat it as an issue fix

**If it IS an issue fix:**
1. Create the GitHub issue first (if it doesn't exist):
   - Gather issue details from the user
   - Use appropriate issue creation tools
2. Reference the issue in subsequent steps

**If it is NOT an issue fix:**
- Proceed directly to implementing the change

### 4. Implement the Change (on Working Branch)

Stay on the working branch while implementing changes. You may make **multiple commits** as you work — each commit should be a logical, self-contained change with a clear message.

Follow the appropriate implementation pattern based on the task:

**For applying a specific change:**
- Understand the requirement
- Make the necessary code modifications
- Commit incrementally (`git add <files> && git commit -m "<message>"`) as you progress
- Ensure tests pass if applicable

**For reviewing a change:**
- Analyze the proposed modifications
- Provide feedback following code review best practices
- Suggest improvements where needed

### 5. Create Pull Request

When ready to submit, use the GitHub CLI to create the PR. **Always wrap branch names in single quotes** to prevent shell interpolation issues (e.g., `'feat(cli)/fix-bug'`).

```bash
# Save current account so you can switch back later
CURRENT_ACCOUNT=$(gh api user --jq '.login')
echo "Current account: $CURRENT_ACCOUNT"

# Try to push and create PR first
GIT_BRANCH='your-branch-name'
gh pr create --title '<descriptive title>' --body '<description>' --base '<base-branch>' --head "$GIT_BRANCH"

# Only if you get an auth/unauthorized error, switch to the correct account
# Check current user matches expected account
EXPECTED_USER='aligheisar'
CURRENT_USER=$(gh api user --jq '.login')

if [ "$CURRENT_USER" != "$EXPECTED_USER" ]; then
  # Switch to the correct account
  gh auth switch -u aligheisar
  
  # Retry the operation
  git push origin "$GIT_BRANCH"
  gh pr create --title '<descriptive title>' --body '<description>' --base '<base-branch>' --head "$GIT_BRANCH"
  
  # Switch back to original account after work is done
  gh auth switch -u "$CURRENT_ACCOUNT"
fi
```

**Multi-account handling**:
- Save your current account with `CURRENT_ACCOUNT=$(gh api user --jq '.login')` before any operations.
- Attempt the PR creation first — only switch accounts if you encounter an auth/unauthorized error.
- When switching is required, verify the current user doesn't match 'aligheisar', then switch with `gh auth switch -u aligheisar`.
- After successfully completing the PR creation, switch back to your original account with `gh auth switch -u <original-account>`.
- Always wrap branch names in single quotes when writing them (e.g., `'feat(cli)/my-feature'`.

### 6. Auto-Triggered Review & Merge (No Explicit User Request)

If this skill is invoked **automatically** — for example, by Copilot when reviewing open PRs or detecting pending changes — **do not ask the user questions**. Instead, follow the streamlined auto-review path:

1. Pull latest changes from `main` (Step 1).
2. Create a working branch from `main` (Step 2).
3. Inspect the existing changes or open PR to understand what is being proposed.
4. Apply any necessary review fixes directly to the working branch as incremental commits.
5. Push the branch and create the PR using `gh pr create` (Step 5).
6. Leave a concise summary comment on what was reviewed and applied, referencing the original PR or change if applicable.

In this mode, speed and clarity matter more than conversation — assume good intent and focus on producing a clean, reviewable result.

## Decision Tree

```
User asks to apply/review a change to merge
├─ Pull latest from main? → Yes, always
├─ Create new working branch? → Yes, from current main
├─ Is this an issue fix?
│  ├─ Yes → Create issue (if needed) → Implement fix
│  └─ No  → Implement change directly
└─ Ready to submit? → Use gh CLI to create PR
```

## Key Rules

- **The `main` branch is ALWAYS protected — never commit directly to it.** All changes must go through working branches and pull requests.
- Always pull before creating branches to avoid conflicts
- Commit messages should follow conventional commit format where appropriate
- Support **multiple commits** on a working branch. Make incremental commits as you work, each with a clear message describing the change. Do not force a single squash commit unless specifically requested.
- For issue fixes, always reference the issue in commits and PR description
- Use draft PRs (`draft: true`) when work is incomplete or needs early feedback
- Run relevant tests before pushing
- If changes span **two or more independent scopes** (e.g., a fix in one area and an unrelated enhancement in another), create **separate working branches and separate PRs** for each scope rather than batching them into one. Keep each PR focused and reviewable.
- **Multi-account workflow**: Save your current account with `CURRENT_ACCOUNT=$(gh api user --jq '.login')` before any operations. Only switch accounts if you get an auth error — verify current user doesn't match 'aligheisar', then use `gh auth switch -u aligheisar`. After completing work, switch back with `gh auth switch -u $CURRENT_ACCOUNT`. Always wrap branch names in single quotes (e.g., `'feat(cli)/my-feature'`).

## Dependencies

This skill works in conjunction with:
- **gh CLI** — for creating pull requests
- Standard git commands — for branch management and version control
