import { z } from "zod";

const flag = z
  .enum(["true", "false"])
  .default("false")
  .transform((v) => v === "true");

const schema = z
  .object({
    DATABASE_URL: z.url(),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url(),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    APPLE_CLIENT_ID: z.string().optional(),
    APPLE_CLIENT_SECRET: z.string().optional(),

    OPENAI_API_KEY: z.string().min(1),
    MODEL_PRIMARY: z.string().min(1),
    MODEL_FALLBACK: z.string().min(1),
    MODEL_PREMIUM: z.string().min(1),
    MODEL_CHEAP: z.string().min(1),

    TRACING_ENABLED: flag,
    // Off: message text is dropped from traces; on: kept with PII redacted.
    TRACE_CONTENT: flag,
    LANGFUSE_PUBLIC_KEY: z.string().optional(),
    LANGFUSE_SECRET_KEY: z.string().optional(),
    LANGFUSE_BASE_URL: z.url().optional(),
    TRACE_HASH_SECRET: z.string().optional(),
  })
  .superRefine((env, ctx) => {
    if (env.TRACING_ENABLED) {
      for (const key of ["LANGFUSE_PUBLIC_KEY", "LANGFUSE_SECRET_KEY", "TRACE_HASH_SECRET"] as const) {
        if (!env[key]) ctx.addIssue({ code: "custom", path: [key], message: "required when TRACING_ENABLED=true" });
      }
    }
    for (const [id, secret] of [
      ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
      ["APPLE_CLIENT_ID", "APPLE_CLIENT_SECRET"],
    ] as const) {
      if (Boolean(env[id]) !== Boolean(env[secret])) {
        ctx.addIssue({ code: "custom", path: [secret], message: `${id} and ${secret} must be set together` });
      }
    }
  });

export type Env = z.infer<typeof schema>;

export function parseEnv(source: Record<string, string | undefined>): Env {
  const result = schema.safeParse(source);
  if (!result.success) {
    const lines = result.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`);
    throw new Error(`Invalid environment configuration:\n${lines.join("\n")}`);
  }
  return result.data;
}

let cached: Env | undefined;

// Parsed on first use, not at import, so unit tests and `next build` run without secrets.
export function env(): Env {
  cached ??= parseEnv(process.env);
  return cached;
}
