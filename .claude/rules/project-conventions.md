# Project conventions — CHAT A.I+

## Layer boundaries
- `app/` → `server/<aggregate>` (repository / service) or `agent/`. Routes hold no SQL and no business rules.
- `features/*` talk to the server only through their `api.ts` (`fetchJson`); never import `server/`, `db/` or `agent/` runtime code.
- A feature imports another feature only via `@/features/<name>` (its `index.ts`).
- Nothing outside `src/dev/`, `src/app/design-states/` and tests imports `@/dev/*`.

## Forbidden
- Client-supplied user ids for authorisation: use `requireUser` / `verifiedUser`; repositories filter by `userId`.
- `[#hex]` / `[Npx]` classes in components: add or reuse a token in `src/styles/tokens.css`.
- A second test layout (`__tests__/`, `tests/`): tests sit beside the file.
- Schema edits without `docs/erd.md` and a generated migration.

## Required
- zod at every route boundary (`server/<aggregate>/schema.ts`, `parseJson`).
- Agent behaviour change → `pnpm evals` green.
- UI change → check `/design-states` at 375, 1024 and 1920.

## Before every commit
- [ ] `pnpm format:check && pnpm typecheck && pnpm lint && pnpm test`
- [ ] hex grep from `.claude/docs/conventions.md` is empty
