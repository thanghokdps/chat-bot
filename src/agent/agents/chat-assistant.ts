import type { Callbacks } from "@langchain/core/callbacks/manager";
import { AIMessage, AIMessageChunk, type BaseMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { createAgent } from "langchain";
import { type AnswerModels, answerModels, cheapModel, type ModelTier, retryableFallbackMiddleware } from "../models";
import { SYSTEM_PROMPT, TITLE_PROMPT } from "../prompt";

export interface HistoryMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AnswerChunk {
  delta?: string;
  /** Sent once, after the last delta. */
  final?: { model: string; inputTokens?: number; outputTokens?: number };
}

export type StreamAnswer = (args: {
  history: HistoryMessage[];
  tier: ModelTier;
  signal: AbortSignal;
  callbacks: Callbacks;
}) => AsyncIterable<AnswerChunk>;

export type GenerateTitle = (prompt: string, signal: AbortSignal) => Promise<string>;

function toLangChain(history: HistoryMessage[]): BaseMessage[] {
  return history.map((m) => (m.role === "user" ? new HumanMessage(m.content) : new AIMessage(m.content)));
}

/** chat-assistant: one agent, no tools (ADR 0001). History comes from the messages table, never a checkpoint. */
export function buildStreamAnswer(modelsFor: (tier: ModelTier) => AnswerModels): StreamAnswer {
  return async function* ({ history, tier, signal, callbacks }) {
    const { primary, fallback } = modelsFor(tier);
    const used = { name: primary.name };
    const agent = createAgent({
      model: primary.model,
      tools: [],
      systemPrompt: SYSTEM_PROMPT,
      middleware: [retryableFallbackMiddleware(fallback, used)],
    });

    let inputTokens: number | undefined;
    let outputTokens: number | undefined;
    const stream = await agent.stream(
      { messages: toLangChain(history) },
      { streamMode: "messages", signal, callbacks },
    );
    for await (const [chunk] of stream) {
      if (!AIMessageChunk.isInstance(chunk)) continue;
      if (chunk.usage_metadata) {
        inputTokens = chunk.usage_metadata.input_tokens;
        outputTokens = chunk.usage_metadata.output_tokens;
      }
      const delta = chunk.text;
      if (delta) yield { delta };
    }
    yield { final: { model: used.name, inputTokens, outputTokens } };
  };
}

export const streamAnswer: StreamAnswer = buildStreamAnswer(answerModels);

export const generateTitle: GenerateTitle = async (prompt, signal) => {
  const reply = await cheapModel().invoke([new SystemMessage(TITLE_PROMPT), new HumanMessage(prompt.slice(0, 2000))], {
    signal,
    runName: "conversation-title",
  });
  return reply.text;
};
