// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SectionHeader } from "./section-header";

afterEach(cleanup);

describe("SectionHeader", () => {
  it("offers Clear All only when given a handler", () => {
    const onClearAll = vi.fn();
    const { rerender } = render(<SectionHeader label="Your conversations" onClearAll={onClearAll} />);
    fireEvent.click(screen.getByRole("button", { name: "Clear All" }));
    expect(onClearAll).toHaveBeenCalled();
    rerender(<SectionHeader label="Older" onClearAll={undefined} />);
    expect(screen.queryByRole("button")).toBeNull();
  });
});
