# Conventions

Source rule: the kit's `agent-code-structure` (agent plugin) plus `~/.claude/rules/`. Project specifics below.

## Folders and ownership

- `features/<feature>/components/*.tsx`, `features/<feature>/api.ts`, `features/<feature>/index.ts`. Another feature imports it only through `@/features/<feature>`.
- Inside a feature, siblings import with `./` and the feature's own modules with `@/features/<same>/...`. Never `../../..`.
- Move a component to `components/ui/` only when a second feature needs it.
- Server: `server/<aggregate>/repository.ts` holds the SQL; `schema.ts` the zod input; `service.ts` only when a route composes repositories.
- Fixtures, mocks and the states page live in `src/dev/` (lint-enforced: `no-restricted-imports`).

## Naming

- Files kebab-case; one exported React component per file, PascalCase; hooks `use-*.ts`.
- Named exports only (route files and Next pages excepted).
- Booleans `is*/has*/can*`; repository functions are verbs on the aggregate (`listConversations`, `setFeedback`).

## Imports

- Order enforced by `import-x/order`: builtin + external, then `@/…`, then relative; alphabetised; no blank lines between groups. `pnpm exec eslint --fix` sorts them.
- `import type` for type-only imports.

## Styling

- Colours, type sizes, radii, shadows, viewport-scaled sizes: tokens in `src/styles/tokens.css` (`text-primary`, `text-15`, `rounded-card`, `shadow-composer`, `w-sidebar`).
- Other spacing: Tailwind's 4px scale (`mt-11.5` = 46px). No `[#hex]` or `[Npx]` in components.
- Mobile first; layout inside the main column uses container queries (`@container` on the frame, `@2xl:` etc.); page chrome uses `lg:` (1024px).

## Size

- Component ≤ ~150 lines, module ≤ ~200; split along seams (sub-component, hook, repository per aggregate).
- Extract on the third copy, not the second.

## Anti-patterns seen and removed here

- One `repo.ts` for every aggregate → split per aggregate.
- Fixtures beside app components → `src/dev/`.
- `w-[348px]`, `text-[#a3a6a8]` in JSX → tokens.

## Pre-commit

- [ ] `pnpm format:check && pnpm typecheck && pnpm lint && pnpm test`
- [ ] `grep -rnE '\[#[0-9a-fA-F]{3,8}\]' src | grep -v 'src/styles\|src/dev'` prints nothing
- [ ] UI change: `/design-states` at 375, 1024 and 1920; agent change: `pnpm evals`
- [ ] No `.env*`, secrets, `console.log`, commented-out code
