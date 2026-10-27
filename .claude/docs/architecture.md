# Architecture

General-purpose AI chat assistant ("CHAT A.I+") from the Figma community file: sign up, chat with streaming answers, edit/regenerate, vote, conversation sidebar with search, background setting, daily plan limits. Single Next.js app (L1) with CopilotKit v2 over AG-UI and one LangChain `createAgent` agent with one validate-only tool (`propose_rename`: the user confirms a rename on a card, which calls the sidebar's PATCH). Full rationale: `docs/adr/0001-agent-architecture.md`.

## Layers

| Path | Responsibility |
|---|---|
| `src/app/` | routes only — pages, layouts, route handlers; validate with zod, call `server/` |
| `src/features/shell` | `AppShell` (CopilotKit provider, `messageFilter` = last message only), `ChatApp`, `AppFrame` (sidebar, drawer, mobile top bar) |
| `src/features/chat` | `ThreadPane` (headless `useAgent`), `Thread` and its parts, `Composer`, `Welcome`, `chatApi` |
| `src/features/conversations` | `Sidebar`, rows, `conversationsApi` |
| `src/features/settings` · `billing` · `auth` | settings dialog · Upgrade tab/pill · sign-up/in screen + Better Auth client |
| `src/components/ui` | primitives shared by ≥ 2 features (`Avatar`) |
| `src/server/<aggregate>` | `repository.ts` (all SQL), `schema.ts` (zod), `service.ts` where a route composes; pure rules (`grouping`, `title`, `rules`, `branch`) |
| `src/server/auth` · `http.ts` | Better Auth instance and enabled providers · `route()`, `requireUser`, `parseJson`, `HttpError` |
| `src/agent` | env schema, models + retryable fallback, prompt, tracing, identity, `runTurn`, `agents/chat-assistant.ts` |
| `src/db` | Drizzle `schema/` (auth, accounts, chat, suggestions), client, seed |
| `src/styles` | `tokens.css` (design tokens), `globals.css` |
| `src/dev` | fixtures and the `/design-states` page — lint forbids importing it from app code |

## One chat turn, end to end

1. `Composer` → `ThreadPane.runTurn` sets agent messages and calls `agent.runAgent({ forwardedProps: { action } })`; the provider's `messageFilter` sends only the newest message.
2. `POST /api/copilotkit` → `verifiedUser` from the Better Auth cookie (401 if none) → a per-request `CopilotRuntime` with a `BuiltInAgent` custom factory closed over the user id.
3. `runTurn` (`src/agent/run-turn.ts`): parse `turnRequestSchema` → `acquireRun` (one live run per conversation, owner-checked) → `usageToday` quota (regenerate exempt) → place the prompt in the `messages` tree → `loadBranch` history → `streamAnswer` (primary model, fallback on 429/5xx) → AG-UI `TEXT_MESSAGE_*` events → `finishMessage` + `setLeaf` → first turn: `generateTitle` (cheap model) → `releaseRun`.
4. Failures save a fixed error reply (`status = error`, not charged); a busy conversation answers with a CUSTOM `notice` event.
5. Client reloads the thread from `GET /api/conversations/:id` so ids match the database.

## External services

| Service | Used for | Config |
|---|---|---|
| OpenAI | answers (`MODEL_PRIMARY` → `MODEL_FALLBACK`; Pro: `MODEL_PREMIUM`), titles and eval judge (`MODEL_CHEAP`) | `OPENAI_API_KEY` |
| Postgres 17 | all app data + Better Auth tables | `DATABASE_URL`, `docker compose` (`POSTGRES_PORT`) |
| Better Auth | email/password, optional Google / Apple | `BETTER_AUTH_*`, `GOOGLE_*`, `APPLE_*` |
| Langfuse (optional) | traces via OpenTelemetry, PII-masked, user ids HMAC-hashed | `TRACING_ENABLED`, `LANGFUSE_*`, `TRACE_HASH_SECRET` |
