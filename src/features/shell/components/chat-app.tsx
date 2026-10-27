"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ChatScroll, Composer, conversationIdFromPath, ThreadPane, Welcome } from "@/features/chat";
import { conversationsApi } from "@/features/conversations";
import { SettingsDialog, settingsApi } from "@/features/settings";
import type { Background, ConversationItem, SuggestionColumnDto, ViewerDto } from "@/lib/types";
import { AppFrame } from "./app-frame";

export function ChatApp({
  viewer,
  background: initialBackground,
  plan,
  suggestions,
}: {
  viewer: ViewerDto;
  background: Background;
  plan: string;
  suggestions: SuggestionColumnDto[];
}) {
  const router = useRouter();
  const activeId = conversationIdFromPath(usePathname());
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [search, setSearch] = useState("");
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);
  const [background, setBackground] = useState(initialBackground);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isUpgradeNoticeShown, setIsUpgradeNoticeShown] = useState(false);

  const refresh = useCallback(() => {
    conversationsApi
      .list(search)
      .then(setConversations)
      .catch(() => setConversations([]));
  }, [search]);

  useEffect(() => {
    const t = setTimeout(refresh, search ? 200 : 0);
    return () => clearTimeout(t);
  }, [refresh, search]);

  async function startConversation(prompt: string) {
    const id = await conversationsApi.create();
    setPendingPrompt(prompt);
    router.push(`/c/${id}`);
  }

  async function remove(id: string) {
    await conversationsApi.remove(id);
    if (id === activeId) router.push("/");
    refresh();
  }

  async function clearAll() {
    if (!window.confirm("Clear all conversations?")) return;
    await conversationsApi.clear();
    router.push("/");
    refresh();
  }

  async function changeBackground(next: Background) {
    setBackground(next);
    await settingsApi.update({ background: next }).catch(() => setBackground(background));
  }

  return (
    <AppFrame
      background={background}
      plan={plan}
      onUpgrade={() => setIsUpgradeNoticeShown(true)}
      sidebar={{
        conversations,
        activeId,
        viewer,
        search,
        onSearch: setSearch,
        onNewChat: () => router.push("/"),
        onOpen: (id) => router.push(`/c/${id}`),
        onRename: (id, title) => void conversationsApi.rename(id, title).then(refresh),
        onDelete: (id) => void remove(id),
        onClearAll: () => void clearAll(),
        onOpenSettings: () => setIsSettingsOpen(true),
      }}
    >
      {activeId ? (
        <ThreadPane
          key={activeId}
          conversationId={activeId}
          viewer={viewer}
          pendingPrompt={pendingPrompt}
          onPendingConsumed={() => setPendingPrompt(null)}
          onTurnFinished={refresh}
          onRename={(title) => conversationsApi.rename(activeId, title).then(refresh)}
        />
      ) : (
        <>
          <ChatScroll>
            <Welcome columns={suggestions} onPick={(p) => void startConversation(p)} />
          </ChatScroll>
          <Composer
            isDisabled={false}
            notice={isUpgradeNoticeShown ? { code: "upgrade", message: "Pro plans are coming soon." } : null}
            onSend={(p) => void startConversation(p)}
          />
        </>
      )}
      {isSettingsOpen && (
        <SettingsDialog
          background={background}
          onChange={(b) => void changeBackground(b)}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </AppFrame>
  );
}
