import { env } from "@/agent/env";

export function enabledProviders(): { google: boolean; apple: boolean } {
  const e = env();
  return { google: Boolean(e.GOOGLE_CLIENT_ID), apple: Boolean(e.APPLE_CLIENT_ID) };
}
