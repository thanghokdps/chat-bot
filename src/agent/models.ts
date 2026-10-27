import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { ChatOpenAI } from "@langchain/openai";
import { createMiddleware } from "langchain";
import { env } from "./env";

export type ModelTier = "standard" | "premium";

function chat(model: string, streaming: boolean): ChatOpenAI {
  // maxRetries 0: fallback middleware owns recovery; SDK retries would double the wait first.
  return new ChatOpenAI({ model, apiKey: env().OPENAI_API_KEY, streaming, streamUsage: true, maxRetries: 0 });
}

export interface NamedModel {
  name: string;
  model: BaseChatModel;
}

export interface AnswerModels {
  primary: NamedModel;
  fallback: NamedModel;
}

export function answerModels(tier: ModelTier): AnswerModels {
  const e = env();
  const primary = tier === "premium" ? e.MODEL_PREMIUM : e.MODEL_PRIMARY;
  return {
    primary: { name: primary, model: chat(primary, true) },
    fallback: { name: e.MODEL_FALLBACK, model: chat(e.MODEL_FALLBACK, true) },
  };
}

export function cheapModel(): ChatOpenAI {
  return chat(env().MODEL_CHEAP, false);
}

const RETRYABLE_CODES = new Set(["ECONNRESET", "ETIMEDOUT", "ECONNREFUSED", "EAI_AGAIN"]);

function statusOf(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null) return undefined;
  const status = Reflect.get(error, "status") ?? Reflect.get(error, "statusCode");
  return typeof status === "number" ? status : undefined;
}

/** Rate limits, overload, 5xx and network drops are worth a second model; 4xx request errors are not. */
export function isRetryableModelError(error: unknown): boolean {
  if (error instanceof Error && error.name === "AbortError") return false;
  const status = statusOf(error);
  if (status !== undefined) return status === 408 || status === 429 || status >= 500;
  const code = typeof error === "object" && error !== null ? Reflect.get(error, "code") : undefined;
  return typeof code === "string" && RETRYABLE_CODES.has(code);
}

export interface ModelUsed {
  name: string;
}

/**
 * L2 over stock `modelFallbackMiddleware`: the stock one falls back on every error, including 400s
 * that would fail identically on the fallback (ADR 0001 decision 5). Records which model answered.
 */
export function retryableFallbackMiddleware(fallback: NamedModel, used: ModelUsed) {
  return createMiddleware({
    name: "RetryableFallback",
    wrapModelCall: async (request, handler) => {
      try {
        return await handler(request);
      } catch (error) {
        if (!isRetryableModelError(error)) throw error;
        used.name = fallback.name;
        return handler({ ...request, model: fallback.model });
      }
    },
  });
}
