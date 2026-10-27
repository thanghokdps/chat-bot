import type { BaseMessage } from "@langchain/core/messages";
import type { ChatGenerationChunk } from "@langchain/core/outputs";
import { FakeListChatModel } from "@langchain/core/utils/testing";
import { FakeToolCallingModel } from "langchain";
import { describe, expect, it } from "vitest";
import { SYSTEM_PROMPT } from "../prompt";
import { type AnswerChunk, buildStreamAnswer, type HistoryMessage } from "./chat-assistant";

// The stock fake's bindTools returns a plain FakeListChatModel, which would drop these overrides.
class FailingModel extends FakeListChatModel {
  constructor(private readonly status: number) {
    super({ responses: ["unused"] });
  }
  override bindTools(): this {
    return this;
  }
  override async *_streamResponseChunks(): AsyncGenerator<ChatGenerationChunk> {
    yield* [];
    throw Object.assign(new Error(`HTTP ${this.status}`), { status: this.status });
  }
}

class RecordingModel extends FakeListChatModel {
  seen: BaseMessage[] = [];
  override bindTools(): this {
    return this;
  }
  override async *_streamResponseChunks(
    messages: BaseMessage[],
    options: this["ParsedCallOptions"],
  ): AsyncGenerator<ChatGenerationChunk> {
    this.seen = messages;
    yield* super._streamResponseChunks(messages, options);
  }
}

async function collect(stream: AsyncIterable<AnswerChunk>): Promise<AnswerChunk[]> {
  const out: AnswerChunk[] = [];
  for await (const c of stream) out.push(c);
  return out;
}

const history: HistoryMessage[] = [{ role: "user", content: "Explain quantum computing in simple terms" }];
const args = { history, tier: "standard" as const, signal: new AbortController().signal, callbacks: [] };

describe("streamAnswer", () => {
  it("streams the primary model's reply and reports it as the answering model", async () => {
    const primary = new RecordingModel({ responses: ["Quantum bits can be 0 and 1 at once."] });
    const stream = buildStreamAnswer(() => ({
      primary: { name: "primary", model: primary },
      fallback: { name: "fallback", model: new FakeListChatModel({ responses: ["unused"] }) },
    }));
    const chunks = await collect(stream(args));

    expect(chunks.map((c) => c.delta ?? "").join("")).toBe("Quantum bits can be 0 and 1 at once.");
    expect(chunks.at(-1)?.final?.model).toBe("primary");
    expect(primary.seen[0]?.text).toBe(SYSTEM_PROMPT);
    expect(primary.seen[1]?.text).toBe(history[0]?.content);
  });

  it("falls back on a rate limit and records the fallback model", async () => {
    const stream = buildStreamAnswer(() => ({
      primary: { name: "primary", model: new FailingModel(429) },
      fallback: { name: "fallback", model: new FakeListChatModel({ responses: ["From the fallback."] }) },
    }));
    const chunks = await collect(stream(args));

    expect(chunks.map((c) => c.delta ?? "").join("")).toBe("From the fallback.");
    expect(chunks.at(-1)?.final?.model).toBe("fallback");
  });

  it("does not fall back on a 400, which would fail the same way", async () => {
    const stream = buildStreamAnswer(() => ({
      primary: { name: "primary", model: new FailingModel(400) },
      fallback: { name: "fallback", model: new FakeListChatModel({ responses: ["should not run"] }) },
    }));
    await expect(collect(stream(args))).rejects.toThrow("HTTP 400");
  });

  it.each([
    ["  Q4 planning ", "Rename this chat to “Q4 planning”?", { title: "Q4 planning" }],
    ["a".repeat(81), "Chat titles must be 1–80 characters. Try a different title.", undefined],
  ])("answers a rename to %j with fixed copy and no second model call", async (title, reply, proposal) => {
    const model = new FakeToolCallingModel({
      toolCalls: [[{ name: "propose_rename", args: { title }, id: "call-1" }], []],
    });
    const stream = buildStreamAnswer(() => ({
      primary: { name: "primary", model },
      fallback: { name: "fallback", model: new FakeListChatModel({ responses: ["unused"] }) },
    }));
    const chunks = await collect(stream(args));

    expect(chunks.map((c) => c.delta ?? "").join("")).toBe(reply);
    expect(chunks.find((c) => c.proposal)?.proposal).toEqual(proposal);
    expect(chunks.at(-1)?.final?.model).toBe("primary");
    expect(model.index).toBe(1);
  });

  it("lets the model retry after schema-invalid args instead of failing the turn", async () => {
    const model = new FakeToolCallingModel({
      toolCalls: [
        [{ name: "propose_rename", args: {}, id: "call-1" }],
        [{ name: "propose_rename", args: { title: "Q4 planning" }, id: "call-2" }],
        [],
      ],
    });
    const stream = buildStreamAnswer(() => ({
      primary: { name: "primary", model },
      fallback: { name: "fallback", model: new FakeListChatModel({ responses: ["unused"] }) },
    }));
    const chunks = await collect(stream(args));

    expect(chunks.map((c) => c.delta ?? "").join("")).toBe("Rename this chat to “Q4 planning”?");
    expect(chunks.find((c) => c.proposal)?.proposal).toEqual({ title: "Q4 planning" });
  });
});
