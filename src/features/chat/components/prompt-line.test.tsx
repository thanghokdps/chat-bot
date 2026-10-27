// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ThreadMessageDto } from "@/lib/types";
import { PromptLine } from "./prompt-line";

afterEach(cleanup);

const prompt: ThreadMessageDto = {
  id: "u1",
  parentMessageId: null,
  role: "user",
  content: "Old question",
  status: "complete",
  rating: null,
};
const viewer = { name: "Ann Lee", image: null };

describe("PromptLine", () => {
  it("cancels an edit without sending", () => {
    const onEdit = vi.fn();
    render(<PromptLine prompt={prompt} viewer={viewer} isLocked={false} onEdit={onEdit} />);
    fireEvent.click(screen.getByRole("button", { name: "Edit prompt" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onEdit).not.toHaveBeenCalled();
    expect(screen.getByText("Old question")).toBeTruthy();
  });

  it("cannot be edited while a reply is streaming", () => {
    render(<PromptLine prompt={prompt} viewer={viewer} isLocked onEdit={vi.fn()} />);
    expect((screen.getByRole("button", { name: "Edit prompt" }) as HTMLButtonElement).disabled).toBe(true);
  });
});
