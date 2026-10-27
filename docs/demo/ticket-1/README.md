# Demo: ticket #1 from issue to PR with the harness kit

Ticket: [thanghokdps/chat-bot#1](https://github.com/thanghokdps/chat-bot/issues/1) "Ask the assistant to rename the current chat" ·
Feature PR: [#2](https://github.com/thanghokdps/chat-bot/pull/2) · Follow-up CI PR: [#3](https://github.com/thanghokdps/chat-bot/pull/3) ·
Contract: [`docs/tickets/1/`](../../tickets/1/) · Date: 2026-10-27 · Kit: agent 5.9.0, dev 4.5.0, ship 4.2.0, core 4.5.0.

The developer typed one line, `/ticket 1`, in a new Claude Code session in this repo and answered the kit's questions. Everything below comes from that session's transcript, `git`, and `gh`.

## Timeline (UTC+7)

| Time        | Skill                     | Step                 | Result                                                                                                      |
| ----------- | ------------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------- |
| 10:33       | `dev:ticket`              | 1 Read the ticket    | `gh issue view 1`: story, 5 acceptance criteria                                                             |
| 10:34–10:36 | `dev:ticket`              | 2 Write the contract | 3 design questions (below); `intent.md`, `spec.md` (8 AC), `plan.md` (6 slices)                             |
| 10:37       | —                         | gate                 | high-risk lane: build waits for approval; user: "approved, start step 3"                                    |
| 10:37–10:51 | `agent:agent-feature`     | 3 Build              | 6 slices; `pnpm evals` 10/10; tests 211/211; running app checked with the browser pane                      |
| 10:51       | —                         | gate                 | user: "yes, go on to step 4"                                                                                |
| 10:51       | `core:verify-done`        | 4 Ship               | evals, format, typecheck, lint, tests re-run fresh                                                          |
| 10:55       | `review:review-checklist` | 4 Ship               | found 1 real bug (below), fixed with a test; evals re-run 10/10; tests 214/214                              |
| 11:03       | —                         | commit               | `517a214 feat: let the assistant propose renaming the current chat (#1)`, code + `docs/tickets/1/` together |
| 11:04       | `ship:finish-branch`      | 4 Ship               | PR #2 opened against `main`                                                                                 |
| 11:07       | —                         | CI                   | `checks` green; `evals` red: repo had no `OPENAI_API_KEY` secret                                            |
| 11:09–11:10 | —                         | follow-up            | user picked option 2; PR #3: skip evals with a visible warning when the secret is missing                   |
| 11:19–11:20 | —                         | merge                | user merged #2, then #3; last `main` CI run green                                                           |

Claude time from `/ticket 1` to PR open: **31 minutes** (10:33:22 → 11:04:10), including about 1 minute of the user's answers.

## Every question Claude asked (6)

| #   | Asked by                                   | Question                                                                                            | Options                                                                                   | Answer                          |
| --- | ------------------------------------------ | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------- |
| 1   | `/ticket` Step 2 (agent-feature fit check) | Where should the confirm step and the rename write happen?                                          | **Propose-only tool + PATCH (Recommended)** · Server-side interrupt (AG-UI 1.0)           | Recommended                     |
| 2   | `/ticket` Step 2                           | What text should the assistant reply with when it proposes a rename, and when the title is invalid? | **Fixed copy (Recommended)** · Model writes the reply                                     | Recommended                     |
| 3   | `/ticket` Step 2                           | If the user asks to rename without giving a title, what should happen?                              | **Model suggests one (Recommended)** · Ask for a title                                    | Recommended                     |
| 4   | high-risk gate                             | Approve the contract and start Step 3?                                                              | free text                                                                                 | "approved, start step 3"        |
| 5   | step gate                                  | Go on to Step 4 (checks, review, commit, PR)?                                                       | free text                                                                                 | "yes, go on to step 4"          |
| 6   | CI failure                                 | Evals cost OpenAI tokens. How should CI handle them?                                                | **1 run on a label (Recommended)** · 2 skip when the secret is missing · 3 remove the job | **2** (not the recommended one) |

Questions 1–3 used `AskUserQuestion` with options; each took the user 4–36 seconds.

## What the kit produced

- Contract, committed with the code: `docs/tickets/1/intent.md`, `spec.md` (8 AC, each with a test-matrix row and evidence), `plan.md` (slices, waves, architecture fit, inventory, 7 deviations).
- ADR 0001 decision 21: the agent's first tool only validates and proposes; the write stays on the existing `PATCH /api/conversations/:id` (session + `userId` ownership).
- 30 files, +708 / −46: tool `src/agent/tools/propose-rename.ts`, `AnswerChunk.proposal`, CUSTOM `rename_proposal` event in `run-turn.ts`, `RenameCard`, `use-rename-proposal` hook, 2 design states, 3 eval cases.

### Slice table (from `plan.md`)

| Slice                   | Skill named                | Runs in                                   | Decision                                                       |
| ----------------------- | -------------------------- | ----------------------------------------- | -------------------------------------------------------------- |
| 1 tool `propose_rename` | /agent-tool                | agent (validate only, `returnDirect`)     | new                                                            |
| 2 answer chunk          | /agent-tool                | agent                                     | extend `AnswerChunk`                                           |
| 3 turn event            | /agent-hitl (propose half) | server (`runTurn` CUSTOM event)           | extend                                                         |
| 4 client card           | /agent-frontend            | browser; Confirm calls the existing PATCH | new card, reuse `Button`, `conversationsApi.rename`, `refresh` |
| 5 design state          | /agent-design-ui           | browser (`/design-states`)                | extend                                                         |
| 6 evals + docs          | /agent-evals               | —                                         | extend                                                         |

## Evidence

- Tests: 214/214 (`pnpm test`, vitest + PGlite). Evals: 10/10 against the real model, last run after the review fix (7 existing + `rename-with-title`, `rename-no-title`, `rename-too-long`).
- Running app (signed in as a throwaway local account): a plain question got a plain answer, no card; "call this chat Q4 planning" showed the card with the sidebar title unchanged; Confirm sent one `PATCH` (200), and the sidebar showed "Q4 planning" without a reload; "rename this chat" got a proposed title; Cancel sent nothing.
- Widths: the card is 343 px wide at 375, 556 px at 1024 and 952 px at 1920, with `scrollWidth == clientWidth` each time.

| Running app                                      | 375, 79-character title                 | 1920                           |
| ------------------------------------------------ | --------------------------------------- | ------------------------------ |
| ![card in the running app](card-running-app.jpg) | ![card at 375](card-375-long-title.jpg) | ![card at 1920](card-1920.jpg) |

## Review findings

- **Fixed:** a `propose_rename` call with schema-invalid args (e.g. `{}`) produced an error ToolMessage that `JSON.parse` threw on, so the turn saved the error reply and broke AC4. Error results are now skipped and the model retries; a test covers it (`chat-assistant.test.ts`).
- **Left open, listed in the PR:** "rename this chat" in a chat whose history already holds "call this chat Q4 planning" re-proposes the current title (the model never sees the title); the card repeats the reply's question.
- **Flake, not caused by the change:** 2 full test runs hit 10-second PGlite timeouts while an eval run was going at the same time.

## Where the kit misbehaved or could do better

Setup (before `/ticket`):

1. `scripts/install.sh` reports the wrong "from" version (says dev 4.0.1 → 4.5.0; `claude plugin list` showed 4.3.1).
2. `plugins/ship/skills/sync-remote/scripts/sync-remote.sh` prints no summary row, so Claude counts rows by hand. Its first real run showed GitLab `main` 7 commits behind GitHub plus 10 GitHub-only branches, contradicting "the remotes match".
3. `core:project-init` writes the user's email into `.claude/memory/user.md` and does not gitignore it. On this public repo it would have leaked; it was excluded by hand.
4. `plugins/core/hooks/branch-guard.sh` matches the word `push` anywhere in a command: it blocked a heredoc log write plus `grep "push"`, with "forced or deleting push … cannot resolve (branch: main)".
5. `branch-guard` has no path for the first push of `main` to an empty remote, even with the user's explicit yes; the user had to run it.
6. The remote was added as HTTPS although the machine pushes over an SSH host alias; the user got a username/password prompt.
7. The first ticket proposed ("rename from the sidebar") already existed in the scaffold; nothing checked the code before proposing a ticket.

During `/ticket`:

8. `plan.md` names a layer skill per slice (`/agent-tool`, `/agent-hitl`, `/agent-frontend`, `/agent-design-ui`, `/agent-evals`), and `/agent-feature` Step 5 says to run each slice through it, but none was invoked; the slices were built inline. `/agent-verify-turn` (Step 7) did not run as a skill either; a manual running-app check stood in for it.
9. Agent 5.9.0's "Opus decides, cheaper models do the typing" was not used: 0 subagent calls in the session.
10. Most edits went through `python3` heredocs in Bash (83 Bash calls, 2 `Edit`, 3 `Write`), so the repo's PostToolUse `eslint-on-edit.sh` (matcher `Edit|Write`) did not fire on them. The final lint gate passed, but the per-edit hook was bypassed.
11. The kit rule "a write is always confirmed by the backend interrupt" (`plugins/agent/rules/agent-identity-and-tools.md`) had no lighter path for this repo (custom AG-UI factory, run-scoped checkpoints, an existing authenticated route for the same write). Claude recommended the exception and recorded it as ADR decision 21; the rule should say when the exception is allowed.
12. Two high-risk ceremonies disagree: the global CLAUDE.md wants `specs/<slug>/` (SUMMARY, PLAN, TEST_MATRIX, ESCALATIONS) plus `/code-review ultra` for auth/data branches; `/ticket` uses `docs/tickets/<id>/` and only `/review-checklist`. No `/code-review` or `/security-review` ran on this high-risk branch.
13. `/finish-branch` opened the PR without checking that the repo had the Actions secret the `evals` job needs; the first agent PR went red on CI.
14. `main` has no required checks, and PR #2 was merged with `evals` red. `/finish-branch` could warn when the base branch has no protection (`/project-init` offers the rulesets).
15. Over Remote Control, Claude cannot start a new desktop session, and `AskUserQuestion` is not available, so the developer opened the `/ticket` session by hand. The walkthrough should say so.
