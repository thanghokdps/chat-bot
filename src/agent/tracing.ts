import { CallbackHandler } from "@langfuse/langchain";
import { createHmac } from "node:crypto";
import { env } from "./env";

const PII_PATTERNS: [RegExp, string][] = [
  [/[\w.+-]+@[\w-]+\.[\w.-]+/g, "[email]"],
  [/\b(?:\d[ -]?){13,19}\b/g, "[card]"],
  [/\+?\d[\d ().-]{7,}\d/g, "[phone]"],
];

export function redactPii(text: string): string {
  return PII_PATTERNS.reduce((acc, [pattern, label]) => acc.replace(pattern, label), text);
}

/** Masks every string in a span payload: dropped entirely unless content tracing is on, then PII-redacted. */
export function maskTraceData(data: unknown, keepContent: boolean): unknown {
  if (typeof data === "string") return keepContent ? redactPii(data) : `[redacted ${data.length} chars]`;
  if (Array.isArray(data)) return data.map((item) => maskTraceData(item, keepContent));
  if (data && typeof data === "object") {
    return Object.fromEntries(Object.entries(data).map(([k, v]) => [k, maskTraceData(v, keepContent)]));
  }
  return data;
}

export function hashUserId(userId: string, secret: string): string {
  return createHmac("sha256", secret).update(userId).digest("hex").slice(0, 32);
}

/** A fresh handler per turn; returns no callbacks when tracing is off so tests and `none` stay silent. */
export function turnCallbacks({
  userId,
  conversationId,
}: {
  userId: string;
  conversationId: string;
}): CallbackHandler[] {
  const e = env();
  if (!e.TRACING_ENABLED || !e.TRACE_HASH_SECRET) return [];
  return [
    new CallbackHandler({
      userId: hashUserId(userId, e.TRACE_HASH_SECRET),
      sessionId: conversationId,
      tags: ["chat-assistant"],
    }),
  ];
}
