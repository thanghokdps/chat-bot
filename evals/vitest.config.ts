import { existsSync } from "node:fs";
import { defineConfig } from "vitest/config";

// .env for local runs; CI sets the same names as real env vars, which loadEnvFile does not overwrite.
if (existsSync(".env")) process.loadEnvFile(".env");

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    include: ["evals/**/*.eval.ts"],
    environment: "node",
    testTimeout: 120_000,
    env: { TRACING_ENABLED: "false" },
  },
});
