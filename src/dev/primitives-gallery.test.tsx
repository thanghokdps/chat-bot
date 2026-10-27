// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PrimitivesGallery } from "./primitives-gallery";

afterEach(cleanup);

describe("PrimitivesGallery", () => {
  it("shows every button variant and opens the dialog and sheet", () => {
    render(<PrimitivesGallery />);
    expect(screen.getAllByRole("button", { name: "outline" })).toHaveLength(3);
    fireEvent.click(screen.getByRole("button", { name: "Open dialog" }));
    expect(screen.getByRole("dialog", { name: "Dialog" })).toBeTruthy();
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    fireEvent.click(screen.getByRole("button", { name: "Open sheet" }));
    expect(screen.getByRole("dialog", { name: "Sheet" })).toBeTruthy();
  });
});
