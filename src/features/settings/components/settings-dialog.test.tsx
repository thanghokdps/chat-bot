// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/auth", () => ({
  authClient: { signUp: { email: vi.fn() }, signIn: { email: vi.fn(), social: vi.fn() }, signOut: vi.fn() },
}));

const { SettingsDialog } = await import("./settings-dialog");

afterEach(cleanup);

describe("SettingsDialog", () => {
  it("marks the current background and reports a new choice", () => {
    const onChange = vi.fn();
    render(<SettingsDialog background="gray" onChange={onChange} onClose={vi.fn()} />);
    expect(screen.getByRole("radio", { name: "gray" }).getAttribute("aria-checked")).toBe("true");
    fireEvent.click(screen.getByRole("radio", { name: "green" }));
    expect(onChange).toHaveBeenCalledWith("green");
  });

  it("closes from the X button and from Escape", () => {
    const onClose = vi.fn();
    render(<SettingsDialog background="gray" onChange={vi.fn()} onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: "Close settings" }));
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
