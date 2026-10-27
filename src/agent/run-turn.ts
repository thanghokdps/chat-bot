import { type BaseEvent, EventType, type Message, type RunAgentInput } from "@ag-ui/core";
import type { Callbacks } from "@langchain/core/callbacks/manager";
import { z } from "zod";
import type { Db } from "@/db/client";
import { getLeafId, ownsConversation, setLeaf, setTitleIfDefault } from "@/server/conversations/repository";
import { acquireRun, releaseRun } from "@/server/conversations/run-lock";
import { cleanModelTitle, provisionalTitle } from "@/server/conversations/title";
import { finishMessage, getMessage, insertMessage, loadBranch } from "@/server/messages/repository";
import { usageToday } from "@/server/plans/service";
import type { GenerateTitle, StreamAnswer } from "./agents/chat-assistant";

export const MAX_PROMPT_CHARS = 8000;

/** What the client may ask for. Ids are re-checked against the caller's conversation before use. */
export const turnRequestSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("send") }),
  z.object({ action: z.literal("edit"), messageId: z.uuid() }),
  z.object({ action: z.literal("regenerate"), messageId: z.uuid() }),
]);
export type TurnRequest = z.infer<typeof turnRequestSchema>;

export type NoticeCode = "invalid_request" | "not_found" | "run_in_progress" | "quota_reached";

/** Fixed copy: the model never paraphrases these, so the UI cannot show a false success. */
export const NOTICES: Record<NoticeCode, string> = {
  invalid_request: "That message could not be sent. Please try again.",
  not_found: "This conversation is no longer available.",
  run_in_progress: "A reply is still being written. Please wait for it to finish.",
  quota_reached: "You've reached today's message limit. Upgrade to Pro for more messages.",
};

export const ERROR_REPLY = "Something went wrong while writing this answer. Please Regenerate.";

export interface TurnDeps {
  db: Db;
  streamAnswer: StreamAnswer;
  generateTitle: GenerateTitle;
  callbacks: Callbacks;
  now?: () => Date;
}

export interface TurnContext {
  userId: string;
  input: RunAgentInput;
  signal: AbortSignal;
}

function lastUserText(messages: Message[]): string | null {
  const last = messages.at(-1);
  if (!last || last.role !== "user") return null;
  const text = typeof last.content === "string" ? last.content : "";
  const trimmed = text.trim();
  return trimmed && trimmed.length <= MAX_PROMPT_CHARS ? trimmed : null;
}

function notice(code: NoticeCode): BaseEvent {
  return { type: EventType.CUSTOM, name: "notice", value: { code, message: NOTICES[code] } };
}

interface PlacedPrompt {
  userMessageId: string;
  /** Set when this turn starts a new conversation, so the title can be generated. */
  firstPrompt: string | null;
}

/** Writes the prompt for send/edit, or finds it for regenerate. Null means the request is not valid here. */
async function placePrompt(
  db: Db,
  conversationId: string,
  request: TurnRequest,
  input: RunAgentInput,
): Promise<PlacedPrompt | null> {
  if (request.action === "regenerate") {
    const reply = await getMessage(db, conversationId, request.messageId);
    if (reply?.role !== "assistant" || !reply.parentMessageId) return null;
    return { userMessageId: reply.parentMessageId, firstPrompt: null };
  }

  const content = lastUserText(input.messages);
  if (!content) return null;

  let parentMessageId: string | null;
  if (request.action === "edit") {
    const original = await getMessage(db, conversationId, request.messageId);
    if (original?.role !== "user") return null;
    parentMessageId = original.parentMessageId;
  } else {
    parentMessageId = await getLeafId(db, conversationId);
  }
  const userMessageId = await insertMessage(db, {
    conversationId,
    parentMessageId,
    role: "user",
    content,
    status: "complete",
  });
  return { userMessageId, firstPrompt: parentMessageId === null ? content : null };
}

/**
 * One chat turn as AG-UI events. Identity comes only from `ctx.userId` (verified session);
 * the thread id is the conversation id and is ownership-checked by `acquireRun`.
 */
export async function* runTurn(ctx: TurnContext, deps: TurnDeps): AsyncGenerator<BaseEvent> {
  const { db } = deps;
  const now = deps.now ?? (() => new Date());
  const conversationId = ctx.input.threadId;
  const parsed = turnRequestSchema.safeParse(ctx.input.forwardedProps ?? { action: "send" });
  if (!parsed.success || !z.uuid().safeParse(conversationId).success) {
    yield notice("invalid_request");
    return;
  }
  const request = parsed.data;

  const runId = crypto.randomUUID();
  if (!(await acquireRun(db, { userId: ctx.userId, conversationId, runId }))) {
    // acquireRun also refuses conversations the caller does not own; tell the two apart only after it fails.
    yield notice((await ownsConversation(db, ctx.userId, conversationId)) ? "run_in_progress" : "not_found");
    return;
  }

  try {
    const plan = await usageToday(db, ctx.userId, now());
    // Regenerate replaces a reply rather than sending a new prompt, so it is allowed past the quota.
    if (request.action !== "regenerate" && plan.usedToday >= plan.dailyMessages) {
      yield notice("quota_reached");
      return;
    }

    const placed = await placePrompt(db, conversationId, request, ctx.input);
    if (!placed) {
      yield notice("invalid_request");
      return;
    }

    const assistantMessageId = await insertMessage(db, {
      conversationId,
      parentMessageId: placed.userMessageId,
      role: "assistant",
      content: "",
      status: "streaming",
    });
    await setLeaf(db, conversationId, assistantMessageId);

    const title = placed.firstPrompt ? startTitle(db, conversationId, placed.firstPrompt, deps, ctx.signal) : null;

    yield {
      type: EventType.CUSTOM,
      name: "turn",
      value: { userMessageId: placed.userMessageId, assistantMessageId },
    };
    yield { type: EventType.TEXT_MESSAGE_START, messageId: assistantMessageId, role: "assistant" };

    const history = await loadBranch(db, conversationId, placed.userMessageId);
    let text = "";
    try {
      for await (const chunk of deps.streamAnswer({
        history: history.map(({ role, content }) => ({ role, content })),
        tier: plan.modelTier,
        signal: ctx.signal,
        callbacks: deps.callbacks,
      })) {
        if (chunk.delta) {
          text += chunk.delta;
          yield { type: EventType.TEXT_MESSAGE_CONTENT, messageId: assistantMessageId, delta: chunk.delta };
        }
        if (chunk.final) {
          await finishMessage(db, assistantMessageId, { content: text, status: "complete", ...chunk.final });
        }
      }
    } catch (error) {
      if (ctx.signal.aborted) {
        // Client left mid-answer (ADR 0001 decision 8): keep what was written, marked stopped.
        await finishMessage(db, assistantMessageId, { content: text, status: "stopped" });
        return;
      }
      console.error("chat turn failed", { conversationId, error: error instanceof Error ? error.message : "unknown" });
      await finishMessage(db, assistantMessageId, { content: ERROR_REPLY, status: "error" });
      yield { type: EventType.TEXT_MESSAGE_CONTENT, messageId: assistantMessageId, delta: ERROR_REPLY };
    }
    yield { type: EventType.TEXT_MESSAGE_END, messageId: assistantMessageId };
    await title;
  } finally {
    await releaseRun(db, conversationId, runId);
  }
}

/** Provisional title now, model title in parallel with the answer; never fails the turn. */
async function startTitle(
  db: Db,
  conversationId: string,
  prompt: string,
  deps: TurnDeps,
  signal: AbortSignal,
): Promise<void> {
  const provisional = provisionalTitle(prompt);
  await setTitleIfDefault(db, conversationId, provisional, "New chat");
  try {
    const title = cleanModelTitle(await deps.generateTitle(prompt, signal));
    if (title) await setTitleIfDefault(db, conversationId, title, provisional);
  } catch (error) {
    console.warn("title generation failed", {
      conversationId,
      error: error instanceof Error ? error.message : "unknown",
    });
  }
}
