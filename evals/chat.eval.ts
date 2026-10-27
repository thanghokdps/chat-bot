import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { afterAll, describe, expect, it } from "vitest";
import { type HistoryMessage, streamAnswer } from "@/agent/agents/chat-assistant";
import { env } from "@/agent/env";
import { judge, type Verdict } from "./judge";

interface EvalCase {
  id: string;
  history: HistoryMessage[];
  criteria: string;
}

const cases: EvalCase[] = readFileSync(new URL("./cases.jsonl", import.meta.url), "utf8")
  .split("\n")
  .filter(Boolean)
  .map((line) => JSON.parse(line) as EvalCase);

// Fail loudly instead of "passing" without a model call.
env();

const results: Record<string, Verdict> = {};

async function answer(history: HistoryMessage[]): Promise<string> {
  let text = "";
  for await (const chunk of streamAnswer({
    history,
    tier: "standard",
    signal: AbortSignal.timeout(90_000),
    callbacks: [],
  })) {
    text += chunk.delta ?? "";
  }
  return text;
}

describe("chat-assistant must-pass evals", () => {
  for (const c of cases) {
    it(c.id, async () => {
      const text = await answer(c.history);
      const verdict = await judge({
        conversation: c.history.map((m) => `${m.role}: ${m.content}`).join("\n\n"),
        answer: text,
        criteria: c.criteria,
      });
      results[c.id] = verdict;
      expect(verdict.pass, verdict.reason).toBe(true);
    });
  }

  afterAll(() => {
    // Report holds verdicts only — never prompt or answer text — so it is safe as a CI artifact.
    mkdirSync("evals/reports", { recursive: true });
    writeFileSync("evals/reports/latest.json", JSON.stringify(results, null, 2));
  });
});
