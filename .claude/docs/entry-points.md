# Entry points

## Boot

`src/app/layout.tsx` (font, `@/styles/globals.css`) · `src/instrumentation.ts` (Langfuse span processor when `TRACING_ENABLED=true`) · `src/agent/env.ts` validates env lazily on first `env()` and fails loudly.

## Pages

| Route | File | Notes |
|---|---|---|
| `/sign-up`, `/sign-in` | `src/app/(auth)/*/page.tsx` | redirect to `/` when signed in; OAuth buttons only for configured providers |
| `/`, `/c/[id]` | `src/app/(app)/layout.tsx` → `AppShell` | layout loads settings, plan, suggestions; pages render nothing |
| `/design-states?state=…` | `src/app/design-states/page.tsx` → `src/dev/design-states.tsx` | 404 in production |
| `/terms`, `/privacy` | placeholders | |

## API routes (all JSON, all behind `requireUser` except auth)

| Method + path | File | Server call |
|---|---|---|
| `GET/POST /api/auth/*` | `api/auth/[...all]` | Better Auth handler |
| `GET/POST /api/copilotkit/*` | `api/copilotkit/[[...path]]` | per-request runtime → `runTurn` |
| `GET/POST/DELETE /api/conversations` | `api/conversations` | `listSidebar` · `createConversation` · `clearConversations` |
| `GET/PATCH/DELETE /api/conversations/:id` | `api/conversations/[id]` | `getThread` · `renameConversation` · `deleteConversation` |
| `PUT /api/messages/:id/feedback` | `api/messages/[id]/feedback` | `setFeedback` |
| `GET/PATCH /api/settings` | `api/settings` | `getSettings` · `updateSettings` |
| `GET /api/me` | `api/me` | `usageToday` |

## Scripts and jobs

`scripts/seed.ts` (`pnpm db:seed`) · `scripts/purge-deleted.ts` (`pnpm db:purge`, run daily: hard-deletes conversations cleared > 30 days ago) · `evals/chat.eval.ts` (`pnpm evals`).

## CI

`.github/workflows/ci.yml`: format:check → typecheck → lint → test on every PR; evals when `src/agent/**` or `evals/**` change (needs `OPENAI_API_KEY` secret and `MODEL_*` variables; without the secret the job skips with an "Evals skipped" warning, so run `pnpm evals` locally).
