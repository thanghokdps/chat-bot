// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ConversationItem } from "@/lib/types";
import { ConversationRow } from "./conversation-row";
import type { SidebarProps } from "./sidebar";

afterEach(cleanup);

const item: ConversationItem = { id: "c1", title: "Trip plan", lastMessageAt: "2026-10-22T00:00:00Z", group: "today" };
const props = (extra: Partial<SidebarProps> = {}): SidebarProps => ({
  conversations: [item],
  activeId: null,
  viewer: { name: "A", image: null },
  search: "",
  onSearch: vi.fn(),
  onNewChat: vi.fn(),
  onOpen: vi.fn(),
  onRename: vi.fn(),
  onDelete: vi.fn(),
  onClearAll: vi.fn(),
  onOpenSettings: vi.fn(),
  ...extra,
});

describe("ConversationRow", () => {
  it("drops a rename on Escape", () => {
    const p = props();
    render(
      <ul>
        <ConversationRow item={item} {...p} />
      </ul>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Rename Trip plan" }));
    const input = screen.getByRole("textbox", { name: "Conversation title" });
    fireEvent.change(input, { target: { value: "New name" } });
    fireEvent.keyDown(input, { key: "Escape" });
    expect(p.onRename).not.toHaveBeenCalled();
    expect(screen.getByText("Trip plan")).toBeTruthy();
  });

  it("marks the active row as the current page", () => {
    render(
      <ul>
        <ConversationRow item={item} {...props({ activeId: "c1" })} />
      </ul>,
    );
    expect(screen.getByRole("button", { name: "Trip plan" }).getAttribute("aria-current")).toBe("page");
  });
});
