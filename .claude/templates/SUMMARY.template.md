# Summary — <slug>

Lane: tiny | normal | high-risk
Confidence: high | medium | low
Reason: <one sentence — which flags fired, or "none">
Flags: <comma-separated risk flags, or `none`>
Input-type: new spec | spec slice | change request | new initiative | maintenance | harness improvement

> `Lane` drives **ceremony** (how much proof). `Confidence` drives **interruption** (whether human is asked).
> A hard gate forces `high-risk`. Low confidence escalates regardless of lane.

## What changed

<filled by Implementer / Debugger / Refactorer after completing work>

## Rationale

<filled by Planner>

## Alternatives considered

- none

## Deviations

- none

## Verify

| Check | Command | Exit | Notes |
|-------|---------|------|-------|
| Format | `pnpm format:check` | 0 | |
| Types | `pnpm typecheck` | 0 | |
| Lint | `pnpm lint` | 0 | |
| Unit + integration | `pnpm test` | 0 | PGlite + scripted fake models, no network |
| Build | `pnpm build` | 0 | |
| Evals (agent change only) | `pnpm evals` | 0 | real model; needs `OPENAI_API_KEY` |
| Behaviour | Playwright on `http://localhost:3001` | — | real turn, or `/design-states?state=<name>` |

## Rollback

- `git revert <sha>`

## Harness-Delta

- none
