---
name: task
description: Lightweight single-task workflow for small fixes and chores in this repo.
---

# Task

For small fixes, chores, single-file changes.

## Steps
1. TaskCreate: describe what needs to be done
2. Read `.claude/docs/conventions.md`
3. Implement the minimal change, with its test beside the file
4. Run: `pnpm format:check && pnpm typecheck && pnpm lint && pnpm test`
5. UI touched → check `/design-states` at 375 / 1024 / 1920; agent touched → `pnpm evals`
6. TaskUpdate: completed
7. Commit on a branch: `<type>: <description>`
