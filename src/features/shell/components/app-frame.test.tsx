// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { SidebarProps } from "@/features/conversations";
import { AppFrame } from "./app-frame";

afterEach(cleanup);

function renderFrame(sidebar: Partial<SidebarProps> = {}) {
  const noop = vi.fn();
  return render(
    <AppFrame
      background="yellow"
      plan="free"
      onUpgrade={noop}
      sidebar={{
        conversations: [{ id: "c1", title: "Trip", lastMessageAt: "2026-10-22T00:00:00Z", group: "today" }],
        activeId: null,
        viewer: { name: "A B", image: null },
        search: "",
        onSearch: noop,
        onNewChat: noop,
        onOpen: noop,
        onRename: noop,
        onDelete: noop,
        onClearAll: noop,
        onOpenSettings: noop,
        ...sidebar,
      }}
    >
      <p>main content</p>
    </AppFrame>,
  );
}

describe("AppFrame", () => {
  it("applies the page background and renders the main content", () => {
    const { container } = renderFrame();
    expect(container.querySelector("[data-background]")?.getAttribute("data-background")).toBe("yellow");
    expect(screen.getByText("main content")).toBeTruthy();
  });

  it("opens the drawer from the menu button and closes it after opening a conversation", () => {
    const onOpen = vi.fn();
    renderFrame({ onOpen });
    expect(screen.queryByRole("dialog", { name: "Menu" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    const drawer = screen.getByRole("dialog", { name: "Menu" });
    fireEvent.click(within(drawer).getByRole("button", { name: "Trip" }));
    expect(onOpen).toHaveBeenCalledWith("c1");
    expect(screen.queryByRole("dialog", { name: "Menu" })).toBeNull();
  });
});
