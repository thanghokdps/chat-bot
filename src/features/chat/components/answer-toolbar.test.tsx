// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ThreadMessageDto } from "@/lib/types";
import { AnswerToolbar } from "./answer-toolbar";

afterEach(cleanup);

const answer: ThreadMessageDto = {
  id: "a1",
  parentMessageId: "u1",
  role: "assistant",
  content: "**Hi**",
  status: "complete",
  rating: null,
};

describe("AnswerToolbar", () => {
  it("copies the raw answer text and confirms it", async () => {
    const writeText = vi.fn(async () => undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(<AnswerToolbar answer={answer} isRunning={false} onRegenerate={vi.fn()} onRate={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Copy answer" }));
    expect(writeText).toHaveBeenCalledWith("**Hi**");
    expect(await screen.findByRole("button", { name: "Copied" })).toBeTruthy();
  });

  it("locks Regenerate while a reply is streaming", () => {
    const onRegenerate = vi.fn();
    render(<AnswerToolbar answer={answer} isRunning onRegenerate={onRegenerate} onRate={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /Regenerate/ }));
    expect(onRegenerate).not.toHaveBeenCalled();
  });
});
