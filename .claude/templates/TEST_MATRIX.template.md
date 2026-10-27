# Test Matrix — <slug>

## Status values

| Status | Meaning |
|--------|---------|
| planned | Accepted as intended behavior, not implemented |
| in_progress | Actively being built |
| implemented | Implemented **and** proof exists |
| changed | Contract changed after earlier implementation |
| retired | No longer part of the contract |

## Matrix

| Behavior | Contract | Unit | Integration (PGlite) | Eval | Browser check | Status | Evidence |
|----------|----------|------|----------------------|------|---------------|--------|----------|
| | no | no | no | no | no | planned | none |

## Evidence rules

- **Unit** — pure domain/application logic
- **Integration** — backend enforcement, data integrity, provider/job/service contracts
- **Eval** — `evals/cases.jsonl` judged against the real model (`pnpm evals`); only when `src/agent/**` or `evals/**` changes
- **Browser check** — Playwright on the running app or `/design-states`; there is no e2e suite yet
- A row may ship without every column if SUMMARY.md explains why (e.g. tiny lane)
- `Evidence` points at the proof: test path, `Verify` row, or commit sha — never `none` for `implemented`
