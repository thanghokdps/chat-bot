# Demo: a real ticket, start to finish

Ticket: [thanghokdps/chat-bot#1](https://github.com/thanghokdps/chat-bot/issues/1) "Ask the assistant to rename the current chat" ·
Feature PR: [#2](https://github.com/thanghokdps/chat-bot/pull/2) · Follow-up CI PR: [#3](https://github.com/thanghokdps/chat-bot/pull/3) ·
Contract: [`docs/tickets/1/`](../../tickets/1/) · Date: 2026-10-27 · Kit used: agent 5.9.0, dev 4.5.0, ship 4.2.0, core 4.5.0.

## Summary

| Question                      | Answer                                                                                                                                                                                                                                                                                        |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| What was built?               | A user types "call this chat Q4 planning"; the assistant shows a card asking to confirm; on Confirm the chat is renamed. Nothing changes without the click.                                                                                                                                   |
| What did the developer do?    | Typed `/ticket 1`, answered 6 questions (3 design choices, 2 go-aheads, 1 CI choice), merged the PRs. No code written by hand.                                                                                                                                                                |
| How long?                     | 31 minutes from `/ticket 1` to the PR being open; the developer's answers took about 1 minute of that.                                                                                                                                                                                        |
| Is it correct?                | All 8 acceptance criteria have a test and evidence. 214/214 unit and integration tests, 10/10 evals against the real model, checked by hand in the running app at phone and desktop width.                                                                                                    |
| Did review catch anything?    | Yes, one real bug before the PR (invalid tool arguments broke the reply), fixed with a test. Two small behaviours are left open (below).                                                                                                                                                      |
| What went wrong?              | PR #2 merged while its `evals` CI job was red. The job failed because the repo had no OpenAI key secret, not because an eval failed. PR #3 makes the job skip with a warning in that case; `main` now requires a PR and a green `checks` job (format, typecheck, lint, tests) before merging. |
| Did the kit work as designed? | Not fully: 15 issues, listed below with status. All 15 are fixed or documented in the kit since (PRs #36, #37, #39). A second ticket run to confirm the fixes has not been done yet.                                                                                                          |

## Terms

- **Acceptance criterion (AC)**: one checkable condition the feature must meet. The ticket listed 5; the contract has 8 (below).
- **Contract**: the three files in `docs/tickets/1/` — `intent.md` (the ticket as written), `spec.md` (criteria, API, test plan), `plan.md` (how it was split up). They ship in the same PR as the code.
- **Slice**: one piece of the build (a tool, a UI card…), finished and tested before the next.
- **Eval**: a test that sends a real message to the real model and checks what the assistant does. Costs OpenAI tokens, so it is separate from the unit tests.
- **High-risk lane**: the ticket touches the AI agent and writes data, so the kit stops for the developer's approval of the contract before writing code.

### Why 8 criteria when the ticket had 5

| AC      | From                                                                                                            |
| ------- | --------------------------------------------------------------------------------------------------------------- |
| AC1–AC6 | the ticket's 5 bullets; "propose and confirm, Cancel leaves it unchanged" became AC1 (propose) and AC2 (cancel) |
| AC7     | the developer's answer to question 3 (rename without a title → the assistant suggests one)                      |
| AC8     | added so ordinary questions keep working (the new tool must not fire on them)                                   |

## Timeline (UTC+7)

| Time        | Kit step                  | Result                                                                                   |
| ----------- | ------------------------- | ---------------------------------------------------------------------------------------- |
| 10:33       | Read the ticket           | GitHub issue #1 read: story and 5 criteria                                               |
| 10:34–10:36 | Write the contract        | 3 design questions to the developer; `intent.md`, `spec.md` (8 AC), `plan.md` (6 slices) |
| 10:37       | Approval gate (high-risk) | developer: "approved, start step 3"                                                      |
| 10:37–10:51 | Build                     | 6 slices; evals 10/10; tests 211/211; checked in the running app                         |
| 10:51       | Gate                      | developer: "yes, go on to step 4"                                                        |
| 10:51       | Verify                    | evals, format, typecheck, lint and tests re-run from scratch                             |
| 10:55       | Self-review               | 1 real bug found and fixed with a test; evals 10/10 again; tests 214/214                 |
| 11:03       | Commit                    | code and `docs/tickets/1/` in one commit, `517a214`                                      |
| 11:04       | Open PR                   | PR #2 against `main`                                                                     |
| 11:07       | CI                        | `checks` green; `evals` red (no OpenAI key secret in the repo)                           |
| 11:09–11:10 | Follow-up                 | developer chose "skip evals with a warning when the key is missing" → PR #3              |
| 11:19–11:20 | Merge                     | developer merged #2, then #3; `main` CI green                                            |

## Every question the developer was asked (6)

| #   | When                 | Question                                                                      | Options (★ = recommended)                                                                                                | Answer       |
| --- | -------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------ |
| 1   | writing the contract | Where do the confirm step and the rename happen?                              | ★ the assistant only proposes; the existing rename API does the write · the agent pauses on the server and writes itself | ★            |
| 2   | writing the contract | What does the assistant reply when it proposes, or when the title is invalid? | ★ fixed text · the model writes it                                                                                       | ★            |
| 3   | writing the contract | "Rename this chat" with no title?                                             | ★ the assistant suggests one · ask for a title                                                                           | ★            |
| 4   | approval gate        | Approve the contract and start building?                                      | free text                                                                                                                | approved     |
| 5   | step gate            | Go on to checks, review, commit and PR?                                       | free text                                                                                                                | yes          |
| 6   | CI failure           | Evals cost OpenAI tokens. How should CI run them?                             | ★ only on a label · skip when the key is missing · remove the job                                                        | skip (not ★) |

Questions 1–3 each took the developer 4–36 seconds.

## What was delivered

- The contract in `docs/tickets/1/`, committed with the code.
- An architecture decision recorded as ADR 0001 decision 21: the assistant may propose a change, but the write goes through the same authenticated API the sidebar already uses, which checks that the chat belongs to the signed-in user.
- 30 files, +708 / −46: the assistant's `propose_rename` tool, the confirm card in the chat, 2 design-preview states, 3 new evals.

### How it was split (from `plan.md`)

| Slice              | Where it runs                                  | New or changed                                    |
| ------------------ | ---------------------------------------------- | ------------------------------------------------- |
| 1 `propose_rename` | agent: checks the title, never writes          | new                                               |
| 2 answer chunk     | agent: carries the proposal to the server      | changed                                           |
| 3 chat event       | server: sends the proposal to the browser      | changed                                           |
| 4 confirm card     | browser: Confirm calls the existing rename API | new card, existing button, API client and refresh |
| 5 design state     | browser preview page                           | changed                                           |
| 6 evals and docs   | —                                              | changed                                           |

## Evidence

- Tests: 214/214. Evals: 10/10 against the real model after the review fix (7 existing + "rename with a title", "rename without a title", "title too long").
- Running app, signed in as a throwaway local account:
  - an ordinary question → ordinary answer, no card;
  - "call this chat Q4 planning" → card shown, sidebar title unchanged;
  - Confirm → one rename request (200), sidebar shows "Q4 planning" without a reload;
  - "rename this chat" → the assistant suggests a title;
  - Cancel → no request sent.
- Widths: card 343px wide at 375, 556px at 1024, 952px at 1920; no horizontal scroll at any of them.

| Running app                                      | 375, 79-character title                 | 1920                           |
| ------------------------------------------------ | --------------------------------------- | ------------------------------ |
| ![card in the running app](card-running-app.jpg) | ![card at 375](card-375-long-title.jpg) | ![card at 1920](card-1920.jpg) |

## Review findings

- **Fixed before the PR:** when the model called the tool with malformed arguments, the reply was saved as an error, breaking AC4. Now the model retries; a test covers it.
- **Left open (listed in PR #2, no ticket yet):**
  - "rename this chat" can suggest the title the chat already has, because the model is not told the current title;
  - the card repeats the question already in the reply.
- **Not caused by this change:** 2 full test runs hit 10-second database timeouts while an eval run was going at the same time; reruns passed.

## Kit issues found, and their status

Kit PRs are in the harness kit repo.

| #   | Issue                                                                                                           | Status                                                                                                                                         |
| --- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
|     | **Setup, before `/ticket`**                                                                                     |                                                                                                                                                |
| 1   | `install.sh` printed the wrong "from" version                                                                   | fixed, kit #36                                                                                                                                 |
| 2   | `sync-remote` printed no summary, so Claude counted rows by hand                                                | fixed, kit #36                                                                                                                                 |
| 3   | `project-init` wrote the user's email to `.claude/memory/user.md` without gitignoring it; excluded by hand here | fixed, kit #36                                                                                                                                 |
| 4   | the branch guard blocked any command containing the word `push`, even in text                                   | fixed, kit #36                                                                                                                                 |
| 5   | no way for Claude to do the first push of `main` to an empty repo                                               | by design: the developer does it; documented, kit #36 and #39                                                                                  |
| 6   | the remote was added as HTTPS, so git asked for a username and password                                         | fixed, kit #36 (uses the machine's SSH form)                                                                                                   |
| 7   | the first ticket proposed already existed in the code                                                           | fixed: `/ticket` searches the code first, kit #36                                                                                              |
|     | **During `/ticket`**                                                                                            |                                                                                                                                                |
| 8   | each slice was built directly instead of through the specialised kit skill named for it                         | fixed, kit #37                                                                                                                                 |
| 9   | all code was written by the expensive model; cheaper models were never used                                     | fixed, kit #37                                                                                                                                 |
| 10  | most edits went through shell scripts, so the per-edit lint hook never ran (final lint still passed)            | fixed, kit #37                                                                                                                                 |
| 11  | the kit's "agent writes always pause on the server" rule had no allowed exception for this simpler design       | fixed: the rule now covers proposals the user applies, kit #36                                                                                 |
| 12  | two kit documents disagreed on the high-risk process; `/code-review` and `/security-review` did not run         | fixed, kit #37                                                                                                                                 |
| 13  | the PR was opened without checking that CI had the secret it needs                                              | fixed: `/finish-branch` checks secrets, kit #37                                                                                                |
| 14  | `main` required no checks, so PR #2 merged with `evals` red                                                     | fixed: `main` now requires a PR and a green `checks` job (`evals` is not required); `/finish-branch` warns when protection is missing, kit #37 |
| 15  | over Remote Control, Claude could not open the desktop session, so the developer started it by hand             | documented, kit #39                                                                                                                            |

Not yet done: a second ticket run on the fixed kit to show issues 8–14 no longer happen.
