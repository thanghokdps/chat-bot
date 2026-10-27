// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { UpgradeTab } from "./upgrade-tab";

afterEach(cleanup);

describe("UpgradeTab", () => {
  it("is hidden for Pro and clickable otherwise", () => {
    const onUpgrade = vi.fn();
    const { rerender } = render(<UpgradeTab plan="free" onUpgrade={onUpgrade} />);
    fireEvent.click(screen.getByRole("button", { name: /Upgrade to Pro/ }));
    expect(onUpgrade).toHaveBeenCalled();
    rerender(<UpgradeTab plan="pro" onUpgrade={onUpgrade} />);
    expect(screen.queryByRole("button", { name: /Upgrade to Pro/ })).toBeNull();
  });
});
