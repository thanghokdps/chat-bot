// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Dialog, DialogContent, DialogTitle } from "./dialog";

afterEach(cleanup);

describe("Dialog", () => {
  it("is a labelled modal that closes from its X and from Escape", () => {
    const onOpenChange = vi.fn();
    render(
      <Dialog open onOpenChange={onOpenChange}>
        <DialogContent aria-describedby={undefined} closeLabel="Close settings">
          <DialogTitle>Settings</DialogTitle>
        </DialogContent>
      </Dialog>,
    );
    const dialog = screen.getByRole("dialog", { name: "Settings" });
    fireEvent.click(screen.getByRole("button", { name: "Close settings" }));
    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(onOpenChange.mock.calls).toEqual([[false], [false]]);
  });

  it("renders nothing while closed", () => {
    render(
      <Dialog open={false}>
        <DialogContent aria-describedby={undefined}>
          <DialogTitle>Settings</DialogTitle>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
