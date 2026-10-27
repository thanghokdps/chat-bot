# Test strategy

## Location (detected)

56 test files, all `*.test.ts(x)` beside the module they cover; none in `__tests__/` or `tests/`. Runner `include` (vitest.config.ts) matches `src/**/*.test.{ts,tsx}`. **New tests go beside the file.** Shared helpers live only in `src/test-utils/`: `pglite.ts` (`testDb`, `createUser`, `exchange`), `route.ts` (mocked session: `signInAs`, `identityMock`, `request`, `params`), `fetch.ts` (`stubFetch`). Evals in `evals/`, never run by `pnpm test`. No e2e suite yet; browser checks run through Playwright MCP against `/design-states` or the running app.

## Layers

| Layer | Tool | Proves | Examples |
|---|---|---|---|
| Pure rules | vitest | branch walk, grouping, titles, plan resolution | `server/messages/branch.test.ts`, `server/plans/rules.test.ts` |
| Repository (integration) | vitest + PGlite with the real migrations and seed | ownership in every query, search, run lock, quota, feedback | `server/*/repository.test.ts`, `server/conversations/run-lock.test.ts` |
| Agent turn | vitest + scripted fake `streamAnswer` | AG-UI event order, quota, busy notice, error reply, edit/regenerate branches | `agent/run-turn.test.ts`, `agent/agents/chat-assistant.test.ts` |
| Route handlers | vitest + PGlite, session mocked through `@/agent/identity` | 401 without a session, 400 on bad input, 404 on another user's resource, response shapes | `app/api/**/route.test.ts`, `app/(app)/layout.test.tsx`, `app/(auth)/*/page.test.tsx` |
| Components | Testing Library + jsdom | what the user sees and clicks | `features/**/components/*.test.tsx` |
| Headless chat | Testing Library, `useAgent` and `chatApi` mocked | turn request shape, pending prompt sent once, notices, vote rollback | `features/chat/components/thread-pane.test.tsx`, `features/shell/components/chat-app.test.tsx` |
| Evals | `pnpm evals`, cheap-model judge | answer quality on the design's prompts, refusal, identity | `evals/cases.jsonl` |

## Rules

- No network in `pnpm test`: models are scripted fakes, the DB is PGlite.
- Do not mock the database or auth checks; test them against PGlite.
- Every implementation file has a test beside it, except (rules/testing.md "skip only for"):
  - config and wiring: `db/client.ts`, `db/schema/*` (checked by `drizzle-kit generate` = no changes, and by every PGlite test), `server/auth/auth.ts`, `instrumentation.ts`, `app/layout.tsx`, `api/auth/[...all]` (library handler), `features/*/index.ts`, `features/auth/auth-client.ts`, `features/shell/components/app-shell.tsx` (provider only)
  - constants and types: `agent/ids.ts`, `agent/prompt.ts` (covered by evals), `lib/types.ts`, `lib/backgrounds.ts`
  - markup with no behaviour: `(app)/page.tsx`, `c/[id]/page.tsx`, `terms`, `privacy`, `apple-mark`, `google-mark`, `social-button`, `section-header`, `chat-scroll`
  - dev and test support: `src/dev/*`, `src/test-utils/*`, `scripts/*`, `db/seed.ts` (runs inside every `testDb()`)
- Every bug fix starts with a failing test; every agent change re-runs `pnpm evals`.

## Commands

`pnpm test` · `pnpm test <path>` · `pnpm test -t "<name>"` · `pnpm evals` · `pnpm evals -t <case-id>`
