// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/auth/auth-client", () => ({
  authClient: { signUp: { email: vi.fn() }, signIn: { email: vi.fn(), social: vi.fn() }, signOut: vi.fn() },
}));

const { AuthScreen, nameFromEmail } = await import("./auth-screen");

afterEach(cleanup);

describe("AuthScreen", () => {
  it("shows the design's sign-up copy with the consent line and enabled providers only", () => {
    render(<AuthScreen mode="sign-up" providers={{ google: true, apple: false }} />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Sign up with free trail");
    expect(screen.getByRole("link", { name: "Terms of Service" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Continue with Google" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Continue with Apple" })).toBeNull();
  });

  it("toggles password visibility and hides OAuth when none is configured", () => {
    render(<AuthScreen mode="sign-in" providers={{ google: false, apple: false }} />);
    const password = screen.getByLabelText("Password*") as HTMLInputElement;
    expect(password.type).toBe("password");
    fireEvent.click(screen.getByRole("button", { name: "Show password" }));
    expect(password.type).toBe("text");
    expect(screen.queryByText("Or better yet...")).toBeNull();
  });
});

describe("nameFromEmail", () => {
  it("derives a display name, since the design's form has no name field", () => {
    expect(nameFromEmail("andrew.neilson@example.com")).toBe("Andrew Neilson");
    expect(nameFromEmail("@example.com")).toBe("Friend");
  });
});
