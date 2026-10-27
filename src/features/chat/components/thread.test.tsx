// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ThreadMessageDto } from "@/lib/types";
import { Thread, toExchanges } from "./thread";

afterEach(cleanup);

const viewer = { name: "Andrew Neilson", image: null };
const m = (
  id: string,
  role: "user" | "assistant",
  content: string,
  extra: Partial<ThreadMessageDto> = {},
): ThreadMessageDto => ({
  id,
  parentMessageId: null,
  role,
  content,
  status: "complete",
  rating: null,
  ...extra,
});

function setup(messages: ThreadMessageDto[], isRunning = false) {
  const handlers = { onEdit: vi.fn(), onRegenerate: vi.fn(), onRate: vi.fn() };
  render(<Thread messages={messages} viewer={viewer} isRunning={isRunning} {...handlers} />);
  return handlers;
}

describe("toExchanges", () => {
  it("pairs prompts with the reply after them and keeps an unanswered prompt", () => {
    const pairs = toExchanges([m("u1", "user", "a"), m("a1", "assistant", "b"), m("u2", "user", "c")]);
    expect(pairs.map((p) => [p.prompt.id, p.answer?.id ?? null])).toEqual([
      ["u1", "a1"],
      ["u2", null],
    ]);
  });
});

describe("Thread", () => {
  const thread = [m("u1", "user", "Create a chatbot"), m("a1", "assistant", "1. **Install** libraries", { rating: 1 })];

  it("renders the prompt and the markdown answer", () => {
    setup(thread);
    expect(screen.getByText("Create a chatbot")).toBeTruthy();
    expect(screen.getByText("Install").tagName).toBe("STRONG");
  });

  it("regenerates the answer by its id", () => {
    const { onRegenerate } = setup(thread);
    fireEvent.click(screen.getByRole("button", { name: /regenerate/i }));
    expect(onRegenerate).toHaveBeenCalledWith("a1");
  });

  it("toggles an existing vote off and switches to the other vote", () => {
    const { onRate } = setup(thread);
    fireEvent.click(screen.getByRole("button", { name: "Good answer" }));
    fireEvent.click(screen.getByRole("button", { name: "Bad answer" }));
    expect(onRate.mock.calls).toEqual([
      ["a1", null],
      ["a1", -1],
    ]);
  });

  it("edits a prompt and sends only a changed text", () => {
    const { onEdit } = setup(thread);
    fireEvent.click(screen.getByRole("button", { name: "Edit prompt" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Edit prompt" }), { target: { value: "Create a Slack bot" } });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));
    expect(onEdit).toHaveBeenCalledWith("u1", "Create a Slack bot");
  });

  it("shows the thinking state and locks actions while a run is in progress", () => {
    setup([m("u1", "user", "Hi")], true);
    expect(screen.getByLabelText("CHAT A.I+ is thinking")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Edit prompt" }).hasAttribute("disabled")).toBe(true);
    expect(screen.queryByRole("button", { name: /regenerate/i })).toBeNull();
  });
});
