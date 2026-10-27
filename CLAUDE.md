# CHAT A.I+ (chatbot)

Coordination (lanes, hard gates, review flow) comes from the global `~/.claude/CLAUDE.md` and the kit plugins. This file holds only what is specific to this repo. Next.js 16 notes: `AGENTS.md`.

## Agent Context

**Read `.claude/docs/index.md` before scanning source files.**

| Doc                             | Contents                                                                                          |
| ------------------------------- | ------------------------------------------------------------------------------------------------- |
| `.claude/docs/architecture.md`  | layers (features / server aggregates / agent), one chat turn end to end, external services        |
| `.claude/docs/conventions.md`   | folder ownership, import order, tokens instead of hex/px, size limits, pre-commit list            |
| `.claude/docs/stack.md`         | pinned versions (Next 16, CopilotKit 1.79, LangChain 1.5, Better Auth, Drizzle) and every command |
| `.claude/docs/entry-points.md`  | pages, the 7 API routes, `/api/copilotkit` runtime, scripts, CI                                   |
| `.claude/docs/test-strategy.md` | tests beside the file, PGlite + scripted fake models, evals                                       |

Decisions: `docs/adr/0001-agent-architecture.md` · data model: `docs/erd.md` · design: `docs/design/ui-map.md`.

## Verify (in this order)

```bash
pnpm format:check
pnpm typecheck
pnpm lint
pnpm test          # vitest + PGlite, no network
pnpm evals         # only when src/agent/** or evals/** changed; real model
```

## Common Commands

```bash
pnpm dev:all       # Docker → Postgres → migrate + seed → dev on :3000 (stop a local Langfuse first; it also uses 3000)
pnpm build
pnpm format
pnpm db:generate   # after editing src/db/schema/* and docs/erd.md
pnpm db:purge      # retention job
```

## Key Rules

- pnpm only; pin exact versions; one LangChain copy.
- Identity only from the Better Auth session (`requireUser` / `verifiedUser`); every repository query filters by `userId`.
- New capability → `src/features/<feature>` + `src/server/<aggregate>`; assistant features through `/agent-feature`.
- No `[#hex]` / `[Npx]` in components — tokens in `src/styles/tokens.css`.
- Tests beside the file; helpers only in `src/test-utils/`.

## Commit

`<type>: <description>` on a `<type>/<slug>` branch; never on main.
