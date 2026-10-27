# CHAT A.I+ — agent docs index

| Doc | Read it for |
|---|---|
| [architecture.md](architecture.md) | what the app does, layers, one chat turn end to end, external services |
| [conventions.md](conventions.md) | folder ownership, naming, imports, tokens, anti-patterns, pre-commit list |
| [stack.md](stack.md) | pinned versions and every command |
| [entry-points.md](entry-points.md) | pages, API routes, the agent runtime, scripts, CI |
| [test-strategy.md](test-strategy.md) | where tests live, what each layer proves, fakes vs real |

Decisions live in `docs/adr/0001-agent-architecture.md`; the data model in `docs/erd.md`; design states and tokens in `docs/design/ui-map.md`.

## Quick orientation

- **Where does a new user capability go?** `src/features/<feature>/` (UI + `api.ts`, exported through `index.ts`), its server side in `src/server/<aggregate>/`, its route in `src/app/api/...`. Use `/agent-feature` for anything the assistant does.
- **Who is the caller?** Only `verifiedUser(headers)` (`src/agent/identity.ts`) / `requireUser(request)` (`src/server/http.ts`). Never a client-sent id.
- **Where is SQL?** Only in `src/server/*/repository.ts`. Routes and the agent call repositories or a `service.ts`.
- **How do I see a UI state without the model?** `/design-states?state=<name>` (dev only), fixtures in `src/dev/fixtures.ts`.
- **Does my change need evals?** Yes if it touches `src/agent/**` or `evals/**` — `pnpm evals` (real model, costs money).

## Constraints

- pnpm only; exact version pins; one LangChain copy (pnpm overrides).
- No raw hex or px in components — tokens from `src/styles/tokens.css`.
- Every mutating route authenticates and checks ownership in the repository query (`userId` in the `where`).
- No secrets in code, logs or traces; tracing masks PII and hashes user ids.
- App runs on port 3000 locally (the port in `BETTER_AUTH_URL`); a local Langfuse also uses 3000 and 5432, so stop it first. Postgres on `POSTGRES_PORT` (5433 here).
