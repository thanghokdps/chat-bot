// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ConversationItem } from "@/lib/types";
import { Sidebar, type SidebarProps } from "./sidebar";

afterEach(cleanup);

const item = (id: string, title: string, group: ConversationItem["group"]): ConversationItem => ({
  id,
  title,
  group,
  lastMessageAt: "2026-10-22T00:00:00Z",
});

function setup(overrides: Partial<SidebarProps> = {}) {
  const props: SidebarProps = {
    conversations: [item("1", "Create POS System", "today"), item("2", "Crypto Lending App Name", "last7Days")],
    activeId: "1",
    viewer: { name: "Andrew Neilson", image: null },
    search: "",
    onSearch: vi.fn(),
    onNewChat: vi.fn(),
    onOpen: vi.fn(),
    onRename: vi.fn(),
    onDelete: vi.fn(),
    onClearAll: vi.fn(),
    onOpenSettings: vi.fn(),
    ...overrides,
  };
  render(<Sidebar {...props} />);
  return props;
}

describe("Sidebar", () => {
  it("groups conversations under the design's section labels with one Clear All", () => {
    setup();
    expect(screen.getByText("Your conversations")).toBeTruthy();
    expect(screen.getByText("Last 7 Days")).toBeTruthy();
    expect(screen.getAllByRole("button", { name: "Clear All" })).toHaveLength(1);
  });

  it("marks the active conversation and opens another", () => {
    const props = setup();
    expect(screen.getByRole("button", { name: "Create POS System" }).getAttribute("aria-current")).toBe("page");
    fireEvent.click(screen.getByRole("button", { name: "Crypto Lending App Name" }));
    expect(props.onOpen).toHaveBeenCalledWith("2");
  });

  it("renames inline and ignores an unchanged title", () => {
    const props = setup();
    fireEvent.click(screen.getByRole("button", { name: "Rename Create POS System" }));
    const input = screen.getByRole("textbox", { name: "Conversation title" });
    fireEvent.submit(input.closest("form") as HTMLFormElement);
    expect(props.onRename).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Rename Create POS System" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Conversation title" }), { target: { value: "POS v2" } });
    fireEvent.click(screen.getByRole("button", { name: "Save title" }));
    expect(props.onRename).toHaveBeenCalledWith("1", "POS v2");
  });

  it("deletes, starts a new chat and searches", () => {
    const props = setup();
    fireEvent.click(screen.getByRole("button", { name: "Delete Create POS System" }));
    fireEvent.click(screen.getByRole("button", { name: "New chat" }));
    fireEvent.click(screen.getByRole("button", { name: "Search conversations" }));
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "pos" } });
    expect(props.onDelete).toHaveBeenCalledWith("1");
    expect(props.onNewChat).toHaveBeenCalled();
    expect(props.onSearch).toHaveBeenCalledWith("pos");
  });

  it("shows the viewer's initials when there is no avatar", () => {
    setup();
    const userPill = screen.getByText("Andrew Neilson").parentElement as HTMLElement;
    expect(within(userPill).getByText("AN")).toBeTruthy();
  });
});
