# Stack

Node ≥ 20 (24 in CI), pnpm 10.24.0. All versions pinned exactly; LangChain has a single copy through `pnpm.overrides`.

| Area | Packages |
|---|---|
| Framework | next 16.4.2 (App Router, Node runtime), react 19.3.1, typescript 6.0.3 (strict) |
| Agent | @copilotkit/runtime + react-core 1.79.1, @ag-ui/core 1.0.2, langchain 1.5.18, @langchain/core 1.2.20, @langchain/openai 1.6.3, @langchain/langgraph 1.5.2 |
| Data | drizzle-orm 0.45.4, drizzle-kit 0.31.11, pg 8.23.1, Postgres 17.6 (docker) |
| Auth | better-auth 1.7.12 |
| Validation | zod 4.6.7 |
| UI | tailwindcss 4.3.3, lucide-react, react-markdown 10.1.0 + remark-gfm, Outfit via `next/font` |
| Tracing | @langfuse/otel · tracing · langchain 6.0.1, OpenTelemetry SDK 2.12 |
| Tooling | vitest 5.0.5, @electric-sql/pglite 0.5.11, Testing Library + jsdom, eslint 10.13.0 + eslint-config-next + eslint-plugin-import-x 4.17.1, prettier 3.9.10 + prettier-plugin-tailwindcss |

## Commands

| What | Command |
|---|---|
| Everything (Docker → Postgres → migrate + seed → dev) | `pnpm dev:all` (`scripts/dev-up.sh`) |
| Dev server only | `pnpm dev` (port 3000; must match `BETTER_AUTH_URL`) |
| Database | `docker compose up -d` → `pnpm db:migrate && pnpm db:seed` |
| Format / check | `pnpm format` / `pnpm format:check` |
| Type-check | `pnpm typecheck` |
| Lint | `pnpm lint` (`pnpm exec eslint --fix .` sorts imports) |
| Tests | `pnpm test`; one file: `pnpm test src/server/plans/repository.test.ts`; by name: `pnpm test -t "quota"` |
| Evals | `pnpm evals`; one case: `pnpm evals -t howto-steps` |
| Build / start | `pnpm build` / `pnpm start` |
| Schema change | edit `src/db/schema/*` + `docs/erd.md` → `pnpm db:generate` → review SQL → `pnpm db:migrate` |
| Retention job | `pnpm db:purge` (daily) |
