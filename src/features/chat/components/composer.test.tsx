// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Composer } from "./composer";

afterEach(cleanup);

function setup(isDisabled = false) {
  const onSend = vi.fn();
  render(<Composer isDisabled={isDisabled} notice={null} onSend={onSend} />);
  return { onSend, box: screen.getByRole("textbox", { name: "Message CHAT A.I+" }) };
}

describe("Composer", () => {
  it("sends the trimmed text on Enter and clears", () => {
    const { onSend, box } = setup();
    fireEvent.change(box, { target: { value: "  Explain quantum computing  " } });
    fireEvent.keyDown(box, { key: "Enter" });
    expect(onSend).toHaveBeenCalledWith("Explain quantum computing");
    expect((box as HTMLTextAreaElement).value).toBe("");
  });

  it("keeps Shift+Enter for a new line and never sends blank text", () => {
    const { onSend, box } = setup();
    fireEvent.change(box, { target: { value: "line" } });
    fireEvent.keyDown(box, { key: "Enter", shiftKey: true });
    fireEvent.change(box, { target: { value: "   " } });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));
    expect(onSend).not.toHaveBeenCalled();
  });

  it("does not send while a reply is streaming", () => {
    const { onSend, box } = setup(true);
    fireEvent.change(box, { target: { value: "hi" } });
    fireEvent.keyDown(box, { key: "Enter" });
    expect(onSend).not.toHaveBeenCalled();
  });

  it("shows a notice as a status message", () => {
    render(
      <Composer isDisabled={false} notice={{ code: "quota_reached", message: "Limit reached" }} onSend={vi.fn()} />,
    );
    expect(screen.getByRole("status").textContent).toBe("Limit reached");
  });
});
