import { useState } from "react";
import { isRenameProposal } from "@/features/chat/agent-messages";

/**
 * The rename the assistant proposed for this conversation, until the user confirms or cancels it.
 * Confirm goes through `onRename` (the sidebar's PATCH); the agent itself never writes.
 */
export function useRenameProposal({
  conversationId,
  onRename,
  onError,
}: {
  conversationId: string;
  onRename: (title: string) => Promise<void>;
  onError: () => void;
}): {
  title: string | null;
  isSaving: boolean;
  receive: (value: unknown) => void;
  clear: () => void;
  confirm: () => Promise<void>;
} {
  const [title, setTitle] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function receive(value: unknown) {
    // A proposal only ever applies to the conversation it was made in.
    if (isRenameProposal(value) && value.conversationId === conversationId) setTitle(value.title);
  }

  async function confirm() {
    if (title === null || isSaving) return;
    setIsSaving(true);
    try {
      await onRename(title);
      setTitle(null);
    } catch {
      onError();
    } finally {
      setIsSaving(false);
    }
  }

  return { title, isSaving, receive, clear: () => setTitle(null), confirm };
}
