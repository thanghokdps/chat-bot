// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Textarea } from "./textarea";

afterEach(cleanup);

describe("Textarea", () => {
  it("renders the bare variant for the composer without a resize handle", () => {
    const onChange = vi.fn();
    render(<Textarea variant="bare" aria-label="Message" onChange={onChange} />);
    const textarea = screen.getByRole("textbox", { name: "Message" });
    expect(textarea.className).toContain("resize-none");
    fireEvent.change(textarea, { target: { value: "hi" } });
    expect(onChange).toHaveBeenCalled();
  });
});
