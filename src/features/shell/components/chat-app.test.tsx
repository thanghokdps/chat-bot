// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FIXTURE_SUGGESTIONS } from "@/dev/fixtures";
import type { ConversationItem } from "@/lib/types";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }), usePathname: () => "/" }));
vi.mock("@copilotkit/react-core/v2", () => ({ UseAgentUpdate: {}, useAgent: vi.fn() }));
const api = {
  list: vi.fn(async (): Promise<ConversationItem[]> => []),
  create: vi.fn(async () => "new-id"),
  clear: vi.fn(async () => ({ cleared: 0 })),
  rename: vi.fn(),
  remove: vi.fn(),
};
vi.mock("@/features/conversations", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  conversationsApi: api,
}));
const update = vi.fn(async () => ({ background: "pink" }));
vi.mock("@/features/settings", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  settingsApi: { update },
}));
vi.mock("@/features/auth", () => ({ authClient: { signOut: vi.fn() } }));

const { ChatApp } = await import("./chat-app");

function renderApp() {
  return render(
    <ChatApp viewer={{ name: "Ann", image: null }} background="gray" plan="trial" suggestions={FIXTURE_SUGGESTIONS} />,
  );
}

beforeEach(() => vi.clearAllMocks());
afterEach(cleanup);

describe("ChatApp", () => {
  it("starts a conversation from a suggestion card and opens it", async () => {
    renderApp();
    fireEvent.click(screen.getByRole("button", { name: /Make a search engine/ }));
    await waitFor(() => expect(push).toHaveBeenCalledWith("/c/new-id"));
    expect(api.create).toHaveBeenCalledTimes(1);
  });

  it("answers Upgrade with the coming-soon notice", () => {
    renderApp();
    fireEvent.click(screen.getAllByRole("button", { name: /Upgrade to Pro/ })[0] as HTMLElement);
    expect(screen.getByText("Pro plans are coming soon.")).toBeTruthy();
  });

  it("applies a new background at once and reverts it when saving fails", async () => {
    update.mockRejectedValueOnce(new Error("offline"));
    const { container } = renderApp();
    fireEvent.click(screen.getByRole("button", { name: "Settings" }));
    fireEvent.click(screen.getByRole("radio", { name: "pink" }));
    const frame = () => container.querySelector("[data-background]")?.getAttribute("data-background");
    expect(frame()).toBe("pink");
    await waitFor(() => expect(frame()).toBe("gray"));
  });

  it("keeps conversations when Clear All is not confirmed", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    api.list.mockResolvedValueOnce([
      { id: "c1", title: "Trip", lastMessageAt: "2026-10-22T00:00:00Z", group: "today" },
    ]);
    renderApp();
    fireEvent.click(await screen.findByRole("button", { name: "Clear All" }));
    expect(api.clear).not.toHaveBeenCalled();
  });
});
