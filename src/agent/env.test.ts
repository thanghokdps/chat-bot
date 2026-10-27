import { describe, expect, it } from "vitest";
import { parseEnv } from "./env";

const valid = {
  DATABASE_URL: "postgres://chat:chat@localhost:5432/chat",
  BETTER_AUTH_SECRET: "x".repeat(32),
  BETTER_AUTH_URL: "http://localhost:3000",
  OPENAI_API_KEY: "sk-test",
  MODEL_PRIMARY: "gpt-a",
  MODEL_FALLBACK: "gpt-b",
  MODEL_PREMIUM: "gpt-c",
  MODEL_CHEAP: "gpt-d",
};

describe("parseEnv", () => {
  it("accepts a complete config with tracing off by default", () => {
    expect(parseEnv(valid).TRACING_ENABLED).toBe(false);
  });

  it("names every missing key", () => {
    expect(() => parseEnv({})).toThrow(/OPENAI_API_KEY[\s\S]*MODEL_PRIMARY/);
  });

  it("requires Langfuse keys and hash secret when tracing is on", () => {
    expect(() => parseEnv({ ...valid, TRACING_ENABLED: "true" })).toThrow(/TRACE_HASH_SECRET/);
  });

  it("rejects half-configured OAuth providers", () => {
    expect(() => parseEnv({ ...valid, GOOGLE_CLIENT_ID: "id" })).toThrow(/GOOGLE_CLIENT_SECRET/);
  });
});
