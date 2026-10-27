// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SocialSignIn } from "./social-sign-in";

afterEach(cleanup);

describe("SocialSignIn", () => {
  it("shows only configured providers and reports the pick", () => {
    const onPick = vi.fn();
    render(<SocialSignIn providers={{ google: false, apple: true }} onPick={onPick} />);
    expect(screen.queryByRole("button", { name: "Continue with Google" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Continue with Apple" }));
    expect(onPick).toHaveBeenCalledWith("apple");
  });

  it("renders nothing when no provider is configured", () => {
    const { container } = render(<SocialSignIn providers={{ google: false, apple: false }} onPick={vi.fn()} />);
    expect(container.innerHTML).toBe("");
  });
});
