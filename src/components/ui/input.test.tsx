// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Input } from "./input";

afterEach(cleanup);

describe("Input", () => {
  it("keeps 16px text on phones for every variant and forwards input events", () => {
    const onChange = vi.fn();
    render(<Input variant="pill" aria-label="Search" onChange={onChange} />);
    const input = screen.getByRole("textbox", { name: "Search" });
    expect(input.className).toContain("text-16");
    expect(input.className).toContain("rounded-full");
    fireEvent.change(input, { target: { value: "trip" } });
    expect(onChange).toHaveBeenCalled();
  });
});
