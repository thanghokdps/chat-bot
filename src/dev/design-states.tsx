"use client";

import { AuthScreen } from "@/features/auth";
import { ChatScroll, Composer, Thread, Welcome } from "@/features/chat";
import { AppFrame } from "@/features/shell";
import type { Background, Notice, ThreadMessageDto } from "@/lib/types";
import {
  FIXTURE_ACTIVE_ID,
  FIXTURE_CONVERSATIONS,
  FIXTURE_ERROR,
  FIXTURE_STREAMING,
  FIXTURE_SUGGESTIONS,
  FIXTURE_THINKING,
  FIXTURE_THREAD,
  FIXTURE_VIEWER,
} from "./fixtures";
import { PrimitivesGallery } from "./primitives-gallery";

const noop = () => undefined;

interface ChatState {
  background: Background;
  messages: ThreadMessageDto[] | null;
  isRunning?: boolean;
  notice?: Notice;
}

export const STATES: Record<string, ChatState | "sign-up" | "sign-in" | "primitives"> = {
  primitives: "primitives",
  "sign-up": "sign-up",
  "sign-in": "sign-in",
  welcome: { background: "gray", messages: null },
  "conversation-blue": { background: "blue", messages: FIXTURE_THREAD },
  "conversation-pink": { background: "pink", messages: FIXTURE_THREAD },
  "conversation-yellow": { background: "yellow", messages: FIXTURE_THREAD },
  "conversation-green": { background: "green", messages: FIXTURE_THREAD },
  thinking: { background: "blue", messages: FIXTURE_THINKING, isRunning: true },
  streaming: { background: "blue", messages: FIXTURE_STREAMING, isRunning: true },
  error: {
    background: "blue",
    messages: FIXTURE_ERROR,
    notice: {
      code: "quota_reached",
      message: "You've reached today's message limit. Upgrade to Pro for more messages.",
    },
  },
};

export function DesignStates({ state }: { state: string }) {
  const config = STATES[state];
  if (!config) return <p className="p-8">Unknown state. Try: {Object.keys(STATES).join(", ")}</p>;
  if (config === "primitives") return <PrimitivesGallery />;
  if (config === "sign-up" || config === "sign-in") {
    return <AuthScreen mode={config} providers={{ google: true, apple: true }} />;
  }

  return (
    <AppFrame
      background={config.background}
      plan="free"
      onUpgrade={noop}
      sidebar={{
        conversations: FIXTURE_CONVERSATIONS,
        activeId: config.messages ? FIXTURE_ACTIVE_ID : null,
        viewer: FIXTURE_VIEWER,
        search: "",
        onSearch: noop,
        onNewChat: noop,
        onOpen: noop,
        onRename: noop,
        onDelete: noop,
        onClearAll: noop,
        onOpenSettings: noop,
      }}
    >
      <ChatScroll>
        {config.messages ? (
          <Thread
            messages={config.messages}
            viewer={FIXTURE_VIEWER}
            isRunning={config.isRunning ?? false}
            onEdit={noop}
            onRegenerate={noop}
            onRate={noop}
          />
        ) : (
          <Welcome columns={FIXTURE_SUGGESTIONS} onPick={noop} />
        )}
      </ChatScroll>
      <Composer isDisabled={config.isRunning ?? false} notice={config.notice ?? null} onSend={noop} />
    </AppFrame>
  );
}
