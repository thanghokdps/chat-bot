# 1 — Plan

Branch: feat/1-assistant-rename-chat · Lane: high-risk (write to a user-owned resource; ADR 0001 "Revisit when" trigger)

| Slice           | Skill                      | Files                                                                                                                                                                                                                                                         | Green when                                                                                                                                     |
| --------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. tool         | /agent-tool                | `src/agent/tools/propose-rename.ts` (+ `.test.ts`)                                                                                                                                                                                                            | valid title → `{ok,title}` trimmed; empty / 81 chars → `{ok:false}`; `returnDirect` set; no DB import                                          |
| 2. answer chunk | /agent-tool                | `src/agent/agents/chat-assistant.ts` (+ `.test.ts`), `src/agent/prompt.ts`                                                                                                                                                                                    | scripted tool-calling fake: valid → copy delta + `proposal` + `final`; invalid → invalid copy, no `proposal`; plain prompt → unchanged         |
| 3. turn event   | /agent-hitl (propose half) | `src/agent/run-turn.ts` (+ `.test.ts`)                                                                                                                                                                                                                        | PGlite: `rename_proposal` CUSTOM with the thread id; saved message = copy, `complete`; title unchanged after the turn                          |
| 4. client card  | /agent-frontend            | `src/features/chat/agent-messages.ts` (+ test), `src/features/chat/components/rename-card.tsx` (+ test), `thread-pane.tsx` (+ test), `src/features/shell/components/chat-app.tsx` (+ test), `src/lib/types.ts`, `src/styles/tokens.css` if a token is missing | Confirm → `onRename(title)` once, then sidebar refresh; Cancel → no call; other-conversation proposal ignored; failure keeps the card + notice |
| 5. design state | /agent-design-ui           | `src/dev/fixtures.ts`, `src/dev/design-states.tsx`                                                                                                                                                                                                            | `/design-states?state=rename-proposal` checked at 375 / 1024 / 1920                                                                            |
| 6. evals + docs | /agent-evals               | `evals/cases.jsonl`, `docs/adr/0001-agent-architecture.md`, `docs/design/ui-map.md`, `.claude/docs/architecture.md`                                                                                                                                           | `pnpm evals` green incl. the new rename cases (AC1, AC4, AC7, AC8); ADR decision 21 recorded                                                   |

Waves: Wave 1: slice 1 → 2 → 3 (each builds on the last chunk/event shape) · Wave 2 (parallel once the event contract in `spec.md` is fixed): slice 4 [features/chat, features/shell] | slice 6 docs [docs/, evals/] · Wave 3: slice 5, then the running-app check (Playwright MCP) for AC1–AC3, AC6.

Verify gates: `pnpm format:check && pnpm typecheck && pnpm lint && pnpm test`, then `pnpm evals` (agent changed), hex grep empty.

## Architecture fit (/agent-feature)

ADR 0001 card: "Shape: A (`createAgent` + CopilotRuntime v2)" · "Agents: `chat-assistant` → general Q&A → 0 tools" · "Writes/HITL: none from the agent; app code writes conversations, messages, feedback".

| Task               | Example message               | Agent          | Tool(s)          |
| ------------------ | ----------------------------- | -------------- | ---------------- |
| Rename this chat   | "call this chat Q4 planning"  | chat-assistant | `propose_rename` |
| Rename, no title   | "rename this chat"            | chat-assistant | `propose_rename` |
| Out of scope (AC8) | "Explain quantum computing …" | chat-assistant | none             |

- "0 tools" (decision 1) → conflict, decided 2026-10-27 by thanghokdps in the approved contract: one validate-only tool; recorded as ADR 0001 decision 21 in slice 6.
- "Writes/HITL: none from the agent" → still holds: the tool never writes; the user's Confirm calls the existing PATCH, exactly what the sidebar rename already lets them do by clicking.
- No new agent, shape, system, credential, transport or client.

## Inventory

| Piece                   | Existing                                                                                                                               |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Agent tools / registry  | none (`grep -rln "tool(" src/agent` → only `models.ts` middleware)                                                                     |
| HITL / pending actions  | none (`grep -rn "interrupt\|useInterrupt\|pending_action" src` → no code hits)                                                         |
| Title rule              | `renameSchema` — `src/server/conversations/schema.ts`                                                                                  |
| Write                   | `renameConversation` — `src/server/conversations/repository.ts`; `PATCH` in `src/app/api/conversations/[id]/route.ts`                  |
| Client write + refresh  | `conversationsApi.rename` — `src/features/conversations/api.ts`; `onRename` + `refresh` — `src/features/shell/components/chat-app.tsx` |
| Custom events / notices | `isNotice`, `onCustomEvent` — `src/features/chat/agent-messages.ts`, `thread-pane.tsx`; `Notice` — `src/lib/types.ts`                  |
| Cards / primitives      | no chat card; `Button` — `src/components/ui/button.tsx`                                                                                |
| Eval fixtures           | `evals/cases.jsonl`, `evals/chat.eval.ts`                                                                                              |

Slices: the table above; decisions — slice 1 tool **new** (no tool exists), 2–3 **extend** (`AnswerChunk`, `runTurn` CUSTOM events like `notice`), 4 card **new** (no card exists) + **reuse** `Button`, `conversationsApi.rename`, `refresh`, 5–6 **extend**. Built as planned (contract approved 2026-10-27).

## Deviations

- 2026-10-27 slice 4: rename state lives in `src/features/chat/hooks/use-rename-proposal.ts` (+ test) instead of inline in `thread-pane.tsx`, to keep the pane near the size limit (it is 162 lines, over the ~150 guide by 12).
- 2026-10-27 slice 4: `Thread` gained a `children` slot (`thread.tsx` + test) so the card sits inside the padding the composer overlaps; `features/chat/index.ts` exports `RenameCard` for `/design-states`.
- 2026-10-27 slice 4: no new token was needed (`rounded-card`, `bg-card`, `border-line`, `text-15`).
- 2026-10-27 slice 5: a second state, `rename-proposal-long` (79-char title), checks wrapping at 375.
- 2026-10-27 slice 6: AC8 is proven by the 7 existing evals passing with the tool bound; 3 new cases (`rename-with-title`, `rename-no-title`, `rename-too-long`). `pnpm evals` 10/10.
- 2026-10-27 review: a `propose_rename` call with schema-invalid args (e.g. `{}`) returned an error ToolMessage that `JSON.parse` threw on, so the turn would have saved the error reply. Now error results are skipped (langchain's `returnDirect` does not apply to them, so the model retries or answers), and `readProposal` re-validates the JSON instead of a cast. Test: `chat-assistant.test.ts` "lets the model retry after schema-invalid args…", `propose-rename.test.ts` "readProposal".
- Observed, not changed: in a chat whose history already holds "call this chat Q4 planning", a later "rename this chat" re-proposed "Q4 planning" (the current title). The model does not see the current title; Cancel is the way out. Candidate follow-up if it matters.
- Observed, not changed: the card repeats the question the reply text already asks (both are the fixed copy).
