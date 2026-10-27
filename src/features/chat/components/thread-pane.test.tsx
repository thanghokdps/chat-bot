// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ThreadDto } from "@/lib/types";

type Subscriber = { onCustomEvent?: (e: { event: { name: string; value: unknown } }) => void };
const agent = {
  messages: [] as unknown[],
  isRunning: false,
  setMessages: vi.fn((m: unknown[]) => {
    agent.messages = m;
  }),
  runAgent: vi.fn(async (_params: unknown, _subscriber?: Subscriber) => undefined),
};
vi.mock("@copilotkit/react-core/v2", () => ({
  UseAgentUpdate: { OnMessagesChanged: "m", OnRunStatusChanged: "r" },
  useAgent: () => ({ agent, isReady: true }),
}));

const thread = (contents: string[]): ThreadDto => ({
  id: "c1",
  title: "T",
  isRunning: false,
  messages: contents.map((content, i) => ({
    id: `m${i}`,
    parentMessageId: i ? `m${i - 1}` : null,
    role: i % 2 ? "assistant" : "user",
    content,
    status: "complete",
    rating: null,
  })),
});
const getThread = vi.fn(async (_id: string) => thread(["hi", "hello"]));
const rate = vi.fn(async (_id: string, rating: number | null) => ({ rating }));
vi.mock("@/features/chat/api", () => ({ chatApi: { getThread, rate } }));

const { ThreadPane } = await import("./thread-pane");

const viewer = { name: "Ann", image: null };
function renderPane(pendingPrompt: string | null = null) {
  const handlers = { onPendingConsumed: vi.fn(), onTurnFinished: vi.fn() };
  render(<ThreadPane conversationId="c1" viewer={viewer} pendingPrompt={pendingPrompt} {...handlers} />);
  return handlers;
}

beforeEach(() => {
  agent.messages = [];
  vi.clearAllMocks();
});
afterEach(cleanup);

describe("ThreadPane", () => {
  it("renders the stored thread", async () => {
    renderPane();
    expect(await screen.findByText("hello")).toBeTruthy();
    expect(getThread).toHaveBeenCalledWith("c1");
  });

  it("sends a prompt as a send turn on top of the stored history, then reloads", async () => {
    const { onTurnFinished } = renderPane();
    await screen.findByText("hello");
    fireEvent.change(screen.getByRole("textbox", { name: "Message CHAT A.I+" }), { target: { value: "next" } });
    fireEvent.keyDown(screen.getByRole("textbox", { name: "Message CHAT A.I+" }), { key: "Enter" });
    await waitFor(() => expect(onTurnFinished).toHaveBeenCalled());
    expect(agent.setMessages.mock.calls[0]?.[0]).toMatchObject([
      { content: "hi" },
      { content: "hello" },
      { content: "next", role: "user" },
    ]);
    expect(agent.runAgent.mock.calls[0]?.[0]).toEqual({ forwardedProps: { action: "send" } });
    expect(getThread).toHaveBeenCalledTimes(2);
  });

  it("sends the prompt typed on the welcome screen exactly once", async () => {
    const { onPendingConsumed } = renderPane("from welcome");
    await waitFor(() => expect(agent.runAgent).toHaveBeenCalledTimes(1));
    expect(onPendingConsumed).toHaveBeenCalledTimes(1);
  });

  it("shows a notice the server sends during the turn", async () => {
    agent.runAgent.mockImplementationOnce(async (_p, subscriber) => {
      subscriber?.onCustomEvent?.({
        event: { name: "notice", value: { code: "run_in_progress", message: "Please wait" } },
      });
    });
    renderPane("again");
    expect(await screen.findByRole("status")).toBeTruthy();
    expect(screen.getByText("Please wait")).toBeTruthy();
  });

  it("rolls a vote back when saving it fails", async () => {
    rate.mockRejectedValueOnce(new Error("offline"));
    renderPane();
    await screen.findByText("hello");
    const good = screen.getByRole("button", { name: "Good answer" });
    await act(async () => fireEvent.click(good));
    await waitFor(() => expect(good.getAttribute("aria-pressed")).toBe("false"));
  });
});
