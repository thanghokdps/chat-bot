import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { env } from "@/agent/env";
import { db } from "@/db/client";
import { tables } from "@/db/schema";

const TRIAL_DAYS = 7;

function socialProviders(): Parameters<typeof betterAuth>[0]["socialProviders"] {
  const e = env();
  return {
    ...(e.GOOGLE_CLIENT_ID && e.GOOGLE_CLIENT_SECRET
      ? { google: { clientId: e.GOOGLE_CLIENT_ID, clientSecret: e.GOOGLE_CLIENT_SECRET } }
      : {}),
    ...(e.APPLE_CLIENT_ID && e.APPLE_CLIENT_SECRET
      ? { apple: { clientId: e.APPLE_CLIENT_ID, clientSecret: e.APPLE_CLIENT_SECRET } }
      : {}),
  };
}

function createAuth() {
  const e = env();
  return betterAuth({
    secret: e.BETTER_AUTH_SECRET,
    baseURL: e.BETTER_AUTH_URL,
    database: drizzleAdapter(db(), { provider: "pg", schema: tables }),
    emailAndPassword: { enabled: true, minPasswordLength: 8 },
    socialProviders: socialProviders(),
    trustedOrigins: [e.BETTER_AUTH_URL, "https://appleid.apple.com"],
    user: {
      additionalFields: {
        termsAcceptedAt: { type: "date", required: false, input: false },
        trialEndsAt: { type: "date", required: false, input: false },
      },
    },
    databaseHooks: {
      user: {
        create: {
          // Every entry path (email form, Google, Apple) shows the consent line, so sign-up records it server-side.
          before: async (u) => ({
            data: {
              ...u,
              termsAcceptedAt: new Date(),
              trialEndsAt: new Date(Date.now() + TRIAL_DAYS * 86_400_000),
            },
          }),
        },
      },
    },
    plugins: [nextCookies()],
  });
}

type Auth = ReturnType<typeof createAuth>;
let instance: Auth | undefined;

export function auth(): Auth {
  instance ??= createAuth();
  return instance;
}
