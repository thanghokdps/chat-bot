"use client";

import { UseAgentUpdate, useAgent } from "@copilotkit/react-core/v2";
import { useEffect, useRef, useState } from "react";
import { AGENT_ID } from "@/agent/ids";
import { fromAgent, isNotice, toAgentMessage } from "@/features/chat/agent-messages";
import { chatApi } from "@/features/chat/api";
import type { Notice, ThreadMessageDto, ViewerDto } from "@/lib/types";
import { ChatScroll } from "./chat-scroll";
import { Composer } from "./composer";
import { Thread } from "./thread";

type TurnRequest =
  { action: "send" } | { action: "edit"; messageId: string } | { action: "regenerate"; messageId: string };

const NETWORK_NOTICE: Notice = { code: "network", message: "Connection lost. Check your network and try again." };

/**
 * One conversation, headless over CopilotKit (ui-map: L3). The database thread is the truth and is what
 * renders at rest; the agent only carries the turn in flight, then the thread is reloaded so ids match.
 */
export function ThreadPane({
  conversationId,
  viewer,
  pendingPrompt,
  onPendingConsumed,
  onTurnFinished,
}: {
  conversationId: string;
  viewer: ViewerDto;
  pendingPrompt: string | null;
  onPendingConsumed: () => void;
  onTurnFinished: () => void;
}) {
  const { agent, isReady } = useAgent({
    agentId: `thread-${conversationId}`,
    runtimeAgentId: AGENT_ID,
    threadId: conversationId,
    updates: [UseAgentUpdate.OnMessagesChanged, UseAgentUpdate.OnRunStatusChanged],
    throttleMs: 30,
  });
  const [thread, setThread] = useState<ThreadMessageDto[] | null>(null);
  const [isTurnActive, setIsTurnActive] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const pendingRef = useRef(pendingPrompt);

  useEffect(() => {
    let isCancelled = false;
    chatApi.getThread(conversationId).then(
      (t) => !isCancelled && setThread(t.messages),
      () => !isCancelled && setNotice(NETWORK_NOTICE),
    );
    return () => {
      isCancelled = true;
    };
  }, [conversationId]);

  async function runTurn(base: ThreadMessageDto[], prompt: string | null, request: TurnRequest) {
    const messages = base.map(toAgentMessage);
    if (prompt) messages.push({ id: crypto.randomUUID(), role: "user", content: prompt });
    agent.setMessages(messages);
    setNotice(null);
    setIsTurnActive(true);
    try {
      await agent.runAgent(
        { forwardedProps: request },
        {
          onCustomEvent: ({ event }) => {
            if (event.name === "notice" && isNotice(event.value)) setNotice(event.value);
          },
        },
      );
    } catch {
      setNotice(NETWORK_NOTICE);
    }
    try {
      setThread((await chatApi.getThread(conversationId)).messages);
    } catch {
      setNotice(NETWORK_NOTICE);
    }
    setIsTurnActive(false);
    onTurnFinished();
  }

  const isBusy = isTurnActive || agent.isRunning || !isReady || thread === null;

  function send(prompt: string) {
    if (isBusy || !thread) return;
    void runTurn(thread, prompt, { action: "send" });
  }

  // A prompt typed on the welcome screen is sent once the thread and the runtime agent are both ready.
  useEffect(() => {
    const prompt = pendingRef.current;
    if (!prompt || thread === null || !isReady) return;
    pendingRef.current = null;
    onPendingConsumed();
    void runTurn(thread, prompt, { action: "send" });
    // Fires on readiness only; runTurn reads the latest state through its arguments.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thread === null, isReady]);

  function edit(messageId: string, content: string) {
    const index = thread?.findIndex((m) => m.id === messageId) ?? -1;
    if (isBusy || !thread || index < 0) return;
    void runTurn(thread.slice(0, index), content, { action: "edit", messageId });
  }

  function regenerate(messageId: string) {
    const index = thread?.findIndex((m) => m.id === messageId) ?? -1;
    if (isBusy || !thread || index < 0) return;
    void runTurn(thread.slice(0, index), null, { action: "regenerate", messageId });
  }

  async function rate(messageId: string, rating: 1 | -1 | null) {
    const previous = thread;
    setThread((t) => t?.map((m) => (m.id === messageId ? { ...m, rating } : m)) ?? t);
    try {
      await chatApi.rate(messageId, rating);
    } catch {
      setThread(previous);
    }
  }

  const isStreaming = isTurnActive || agent.isRunning;
  const shown = isStreaming ? fromAgent(agent.messages, thread ?? []) : (thread ?? []);

  return (
    <>
      <ChatScroll>
        {thread && (
          <Thread
            messages={shown}
            viewer={viewer}
            isRunning={isStreaming}
            onEdit={edit}
            onRegenerate={regenerate}
            onRate={(id, r) => void rate(id, r)}
          />
        )}
      </ChatScroll>
      <Composer isDisabled={isBusy} notice={notice} onSend={send} />
    </>
  );
}
