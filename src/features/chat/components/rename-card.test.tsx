// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RenameCard } from "./rename-card";

afterEach(cleanup);

function renderCard(isSaving = false) {
  const handlers = { onConfirm: vi.fn(), onCancel: vi.fn() };
  render(<RenameCard title="Q4 planning" isSaving={isSaving} {...handlers} />);
  return handlers;
}

describe("RenameCard", () => {
  it("names the proposed title", () => {
    renderCard();
    expect(screen.getByRole("region", { name: "Rename this chat" }).textContent).toContain("“Q4 planning”");
  });

  it("confirms and cancels through its buttons", () => {
    const { onConfirm, onCancel } = renderCard();
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("locks both buttons while the rename is saving", () => {
    renderCard(true);
    expect(screen.getByRole("button", { name: "Confirm" })).toHaveProperty("disabled", true);
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveProperty("disabled", true);
  });
});
