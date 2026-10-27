# 1 — Spec

## Acceptance criteria

| #   | Given                                       | When                                                                      | Then                                                                                                                                                                                          | Source                               |
| --- | ------------------------------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| AC1 | a signed-in user in a conversation they own | they send "call this chat Q4 planning"                                    | the reply is the fixed copy `Rename this chat to “Q4 planning”?` with a confirm card (Confirm / Cancel); the conversation title is still unchanged                                            | ticket                               |
| AC2 | the confirm card is shown                   | the user clicks Cancel                                                    | the card closes, no rename request is sent, the title is unchanged                                                                                                                            | ticket                               |
| AC3 | the confirm card is shown                   | the user clicks Confirm                                                   | `PATCH /api/conversations/:id` sets the title; the sidebar row shows the new title without a page reload; the card closes                                                                     | ticket                               |
| AC4 | a signed-in user in their conversation      | they ask for a title that is empty after trimming or longer than 80 chars | the reply is the fixed copy `Chat titles must be 1–80 characters. Try a different title.`; no card; the message status is `complete` (not `error`); the title is unchanged                    | ticket                               |
| AC5 | a proposal                                  | it is produced, shown or confirmed                                        | it targets only the turn's conversation (the thread id `acquireRun` ownership-checked); the client ignores a proposal for any other conversation; PATCH on another user's conversation is 404 | ticket                               |
| AC6 | the confirm card is shown                   | the viewport is 375, 1024 or 1920 wide                                    | the card and its buttons are fully visible and usable, with no horizontal scroll                                                                                                              | ticket                               |
| AC7 | a signed-in user in their conversation      | they send "rename this chat" with no title                                | the model proposes a short title drawn from the conversation, shown on the same confirm card                                                                                                  | decision 2026-10-27                  |
| AC8 | a signed-in user                            | they ask something unrelated to renaming                                  | the tool is not called; the answer streams as before                                                                                                                                          | decision 2026-10-27 (non-regression) |

## Contract

**Agent tool** `propose_rename` (`src/agent/tools/propose-rename.ts`) — LangChain `tool()`, `returnDirect: true` (no second model call).

- Args: `{ title: string }` — the title exactly as the user wrote it, or one the model chose when none was given.
- Validates with `renameSchema` (`src/server/conversations/schema.ts`: trimmed, 1–80). Never writes.
- Result: `{ ok: true, title: <trimmed> }` or `{ ok: false }`.

**Fixed copy** (exported constants, never paraphrased by the model):

- proposal: `Rename this chat to “<title>”?`
- invalid: `Chat titles must be 1–80 characters. Try a different title.`

**`streamAnswer` chunk** (`src/agent/agents/chat-assistant.ts`): `AnswerChunk` gains `proposal?: { title: string }`. On a `propose_rename` result it yields `{ delta: <fixed copy> }`, then `{ proposal }` when valid, then the usual `final`.

**AG-UI event** (`runTurn`): `CUSTOM` `name: "rename_proposal"`, `value: { conversationId: <threadId>, title: <trimmed> }`, emitted after the copy's `TEXT_MESSAGE_CONTENT` and before `TEXT_MESSAGE_END`. The saved assistant message holds the fixed copy, `status = complete`.

**Write**: unchanged `PATCH /api/conversations/:id` `{ title }` → `200 { title }` · `400` invalid · `401` no session · `404` not owned / deleted. Client calls it through `conversationsApi.rename`.

**UI state**: `RenameCard` under the last answer while a proposal for the open conversation is pending — title quoted, Confirm (primary) and Cancel. Confirm disables both buttons while the request runs; on failure the card stays and the composer notice shows `Could not rename this chat. Please try again.` A new turn or Cancel clears it. Design state: `/design-states?state=rename-proposal`.

## Out of scope

- The card surviving a page reload (the fixed question stays in the transcript; the title is unchanged, so nothing is half-done).
- A server-side pending-action store or AG-UI interrupt/resume (decision 2026-10-27; revisit with the first tool whose write must run server-side).
- Renaming any conversation other than the open one, or by name.
- Undo, and any change to the sidebar's own rename.
- Quota: a rename request is a normal turn and counts like one.

## Test matrix

| AC  | Unit | Integration | E2E | Status      | Evidence                                                                                                                                                                                                                                            |
| --- | ---- | ----------- | --- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC1 | yes  | yes         | yes | implemented | `src/agent/tools/propose-rename.test.ts`, `chat-assistant.test.ts`, `run-turn.test.ts` "proposes a rename…", `thread-pane.test.tsx` "shows the rename card…"; eval `rename-with-title`; running app 2026-10-27: card shown, sidebar title unchanged |
| AC2 | yes  | no          | yes | implemented | `thread-pane.test.tsx` "closes the card on Cancel…", `rename-card.test.tsx`; running app: card closed, no request after Cancel                                                                                                                      |
| AC3 | yes  | yes         | yes | implemented | `thread-pane.test.tsx`, `use-rename-proposal.test.ts`, `chat-app.test.tsx` "renames the open conversation…"; running app: one `PATCH` 200 → list refetch → sidebar "Q4 planning", same document                                                     |
| AC4 | yes  | yes         | no  | implemented | `propose-rename.test.ts` (empty, 81 chars), `chat-assistant.test.ts`, `run-turn.test.ts` "answers an invalid title…", `chat-assistant.test.ts` "lets the model retry after schema-invalid args…"; eval `rename-too-long`                            |
| AC5 | yes  | yes         | no  | implemented | `run-turn.test.ts` (event carries the turn's thread id), `use-rename-proposal.test.ts` + `thread-pane.test.tsx` "ignores a proposal for another conversation", `api/conversations/[id]/route.test.ts:35` (PATCH on another user's chat → 404)       |
| AC6 | no   | no          | yes | implemented | `/design-states?state=rename-proposal(-long)`: 375 → card 343px, 1024 → 556px, 1920 → 952px; `scrollWidth == clientWidth` at each                                                                                                                   |
| AC7 | no   | eval        | no  | implemented | eval `rename-no-title`; running app: proposal shown on the card                                                                                                                                                                                     |
| AC8 | yes  | eval        | no  | implemented | `chat-assistant.test.ts` plain-prompt cases; the 7 existing evals pass with the tool bound; running app: plain answer, no card                                                                                                                      |

Unit = vitest (tool, chunk mapping, card, thread pane). Integration = `run-turn.test.ts` on PGlite, `api/conversations/[id]/route.test.ts`, and `pnpm evals` where marked "eval". E2E = Playwright MCP on `/design-states` and the running app.

## Decisions

- 2026-10-27 Where do the confirm and the write happen? → The agent tool only proposes; the card's Confirm calls the existing `PATCH /api/conversations/:id` (session + `userId` ownership). No migration, and the agent never writes. (thanghokdps)
- 2026-10-27 What does the assistant say? → Fixed copy from a `returnDirect` tool for both the proposal and an invalid title, with no second model call. (thanghokdps)
- 2026-10-27 A rename request with no title? → The model suggests a title from the conversation; the user still confirms. (thanghokdps)

## Changes

- none
