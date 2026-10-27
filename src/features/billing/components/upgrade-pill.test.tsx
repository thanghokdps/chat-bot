// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { UpgradePill } from "./upgrade-pill";

afterEach(cleanup);

describe("UpgradePill", () => {
  it("offers the upgrade on the mobile bar, and nothing for Pro", () => {
    const onUpgrade = vi.fn();
    const { rerender } = render(<UpgradePill plan="trial" onUpgrade={onUpgrade} />);
    fireEvent.click(screen.getByRole("button", { name: "Upgrade to Pro" }));
    expect(onUpgrade).toHaveBeenCalled();
    rerender(<UpgradePill plan="pro" onUpgrade={onUpgrade} />);
    expect(screen.queryByRole("button")).toBeNull();
  });
});
