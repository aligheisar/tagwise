---
name: git-merge-workflow
description: >
  Use this skill when applying or reviewing code changes that need to be merged.
  Handles the full workflow: pulling main, creating a feature branch, handling
  issue-based fixes (including issue creation), implementing the change, and
  creating a pull request via the create-pull-request skill.
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

### 2. Create New Feature Branch

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

### 4. Implement the Change

Follow the appropriate implementation pattern based on the task:

**For applying a specific change:**
- Understand the requirement
- Make the necessary code modifications
- Ensure tests pass if applicable

**For reviewing a change:**
- Analyze the proposed modifications
- Provide feedback following code review best practices
- Suggest improvements where needed

### 5. Create Pull Request

When ready to submit, use the **create-pull-request** skill to:
- Commit any pending changes
- Push the branch to remote
- Create the PR with appropriate title and description
- Reference related issues with `Fixes #<number>` if applicable
- Use appropriate labels for the issue or PR when applicable

## Decision Tree

```
User asks to apply/review a change to merge
├─ Pull latest from main? → Yes, always
├─ Create new branch? → Yes, from current main
├─ Is this an issue fix?
│  ├─ Yes → Create issue (if needed) → Implement fix
│  └─ No  → Implement change directly
└─ Ready to submit? → Use create-pull-request skill
```

## Key Rules

- Always pull before creating branches to avoid conflicts
- Commit messages should follow conventional commit format where appropriate
- For issue fixes, always reference the issue in commits and PR description
- Use draft PRs (`draft: true`) when work is incomplete or needs early feedback
- Run relevant tests before pushing

## Dependencies

This skill works in conjunction with:
- **create-pull-request** skill — for submitting the final PR
- Standard git commands — for branch management and version control
