// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Sheet, SheetContent, SheetTitle } from "./sheet";

afterEach(cleanup);

describe("Sheet", () => {
  it("opens as a labelled drawer and closes on Escape", () => {
    const onOpenChange = vi.fn();
    render(
      <Sheet open onOpenChange={onOpenChange}>
        <SheetContent>
          <SheetTitle>Menu</SheetTitle>
        </SheetContent>
      </Sheet>,
    );
    const drawer = screen.getByRole("dialog", { name: "Menu" });
    expect(drawer.getAttribute("data-state")).toBe("open");
    fireEvent.keyDown(drawer, { key: "Escape" });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
