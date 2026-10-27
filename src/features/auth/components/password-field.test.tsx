// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PasswordField } from "./password-field";

afterEach(cleanup);

describe("PasswordField", () => {
  it("reports typing and toggling, and asks for a new password on sign-up", () => {
    const onChange = vi.fn();
    const onToggle = vi.fn();
    render(<PasswordField mode="sign-up" value="" isVisible={false} onChange={onChange} onToggle={onToggle} />);
    const input = screen.getByPlaceholderText("Enter password") as HTMLInputElement;
    expect(input.type).toBe("password");
    expect(input.autocomplete).toBe("new-password");
    fireEvent.change(input, { target: { value: "secret-123" } });
    expect(onChange).toHaveBeenCalledWith("secret-123");
    fireEvent.click(screen.getByRole("button", { name: "Show password" }));
    expect(onToggle).toHaveBeenCalled();
  });
});
