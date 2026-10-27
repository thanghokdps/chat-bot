import { describe, expect, it } from "vitest";
import type { ThreadMessageDto } from "@/lib/types";
import { conversationIdFromPath, fromAgent, isNotice, isRenameProposal, toAgentMessage } from "./agent-messages";

const stored: ThreadMessageDto = {
  id: "a1",
  parentMessageId: "u1",
  role: "assistant",
  content: "old",
  status: "complete",
  rating: 1,
};

describe("chat helpers", () => {
  it("conversationIdFromPath accepts only /c/<uuid>", () => {
    const id = "0b1f6a3c-4b1e-4f7e-9a51-1c2d3e4f5a6b";
    expect(conversationIdFromPath(`/c/${id}`)).toBe(id);
    expect(conversationIdFromPath("/")).toBeNull();
    expect(conversationIdFromPath("/c/../../etc")).toBeNull();
  });

  it("isNotice rejects malformed custom events", () => {
    expect(isNotice({ code: "quota_reached", message: "x" })).toBe(true);
    expect(isNotice({ code: 1, message: "x" })).toBe(false);
    expect(isNotice(null)).toBe(false);
  });

  it("toAgentMessage keeps only what the wire needs", () => {
    expect(toAgentMessage(stored)).toEqual({ id: "a1", role: "assistant", content: "old" });
  });

  it("fromAgent keeps stored votes, marks new replies streaming and drops other roles", () => {
    const shown = fromAgent(
      [
        { id: "a1", role: "assistant", content: "old" },
        { id: "u2", role: "user", content: "next" },
        { id: "a2", role: "assistant", content: "Par" },
        { id: "t1", role: "tool", content: "{}", toolCallId: "c1" },
      ],
      [stored],
    );
    expect(shown.map((m) => [m.id, m.status, m.rating])).toEqual([
      ["a1", "complete", 1],
      ["u2", "complete", null],
      ["a2", "streaming", null],
    ]);
  });
});

describe("isRenameProposal", () => {
  it("accepts a conversation id and a title, nothing else", () => {
    expect(isRenameProposal({ conversationId: "c1", title: "Q4 planning" })).toBe(true);
    expect(isRenameProposal({ conversationId: "c1" })).toBe(false);
    expect(isRenameProposal({ conversationId: 1, title: "x" })).toBe(false);
    expect(isRenameProposal(null)).toBe(false);
  });
});
