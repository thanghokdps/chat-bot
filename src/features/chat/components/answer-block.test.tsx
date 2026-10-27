// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ThreadMessageDto } from "@/lib/types";
import { AnswerBlock } from "./answer-block";

afterEach(cleanup);

const reply = (extra: Partial<ThreadMessageDto>): ThreadMessageDto => ({
  id: "a1",
  parentMessageId: "u1",
  role: "assistant",
  content: "",
  status: "complete",
  rating: null,
  ...extra,
});
const props = { onRegenerate: vi.fn(), onRate: vi.fn() };

describe("AnswerBlock", () => {
  it("shows the thinking dots until the first token, without a toolbar", () => {
    render(<AnswerBlock answer={null} isLast isRunning {...props} />);
    expect(screen.getByLabelText("CHAT A.I+ is thinking")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Regenerate/ })).toBeNull();
  });

  it("renders a failed reply's fixed text with Regenerate", () => {
    render(
      <AnswerBlock
        answer={reply({ content: "Something went wrong.", status: "error" })}
        isLast
        isRunning={false}
        {...props}
      />,
    );
    expect(screen.getByText("Something went wrong.")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Regenerate/ })).toBeTruthy();
  });

  it("hides the toolbar on the reply that is still streaming", () => {
    render(<AnswerBlock answer={reply({ content: "Partial", status: "streaming" })} isLast isRunning {...props} />);
    expect(screen.getByText("Partial")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Copy answer" })).toBeNull();
  });
});
