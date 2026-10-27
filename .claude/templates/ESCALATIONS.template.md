# Escalations — <slug>

Default: **deny-on-no-response**. No recorded decision → work stays blocked.

---

<!-- Add entries when: hard gate fires, confidence is low, direction is ambiguous -->

<!-- Hard gates in this repo: Better Auth config or `src/server/auth/**`; `src/app/api/**` route auth/ownership checks;
     `src/db/schema/**` + `drizzle/` migrations; `src/agent/prompt.ts`, models or fallback (re-run `pnpm evals`);
     tracing/masking (`src/agent/tracing.ts`, `src/instrumentation.ts`); plan limits and quota; new dependency;
     `.claude/` config. -->

<!--
E001
- raised_by: <orchestrator | agent name>
- date: <YYYY-MM-DD>
- trigger: hard-gate | low-confidence | ambiguous-direction | in-flight | system-redefinition
- question: <one sentence — the decision needed>
- context: <one line — what work is blocked on this>
- options:
    - A) <option + consequence>
    - B) <option + consequence>
- default_if_no_response: BLOCK
- decision: pending
- decided_by:
- decided_at:
-->
