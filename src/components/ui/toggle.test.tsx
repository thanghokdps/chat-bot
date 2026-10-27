// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Toggle } from "./toggle";

afterEach(cleanup);

describe("Toggle", () => {
  it("exposes the pressed state and reports the next one", () => {
    const onPressedChange = vi.fn();
    render(<Toggle aria-label="Good answer" pressed={false} onPressedChange={onPressedChange} />);
    const toggle = screen.getByRole("button", { name: "Good answer" });
    expect(toggle.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(toggle);
    expect(onPressedChange).toHaveBeenCalledWith(true);
  });
});
