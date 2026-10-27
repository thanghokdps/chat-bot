import type { Background } from "./backgrounds";

// JSON shapes of the REST routes as the browser receives them (dates arrive as strings).

export type ConversationGroup = "today" | "last7Days" | "older";

export interface ConversationItem {
  id: string;
  title: string;
  lastMessageAt: string;
  group: ConversationGroup;
}

export interface ThreadMessageDto {
  id: string;
  parentMessageId: string | null;
  role: "user" | "assistant";
  content: string;
  status: "streaming" | "complete" | "stopped" | "error";
  rating: number | null;
}

export interface ThreadDto {
  id: string;
  title: string;
  isRunning: boolean;
  messages: ThreadMessageDto[];
}

export interface SuggestionColumnDto {
  slug: string;
  title: string;
  description: string;
  icon: "globe" | "bolt" | "warning";
  cards: { id: string; title: string; prompt: string; imageUrl: string | null }[];
}

export interface ViewerDto {
  name: string;
  image: string | null;
}

/** CUSTOM `rename_proposal` from a turn: a title the user still has to confirm (ticket 1). */
export interface RenameProposal {
  conversationId: string;
  title: string;
}

export interface Notice {
  code: string;
  message: string;
}

export type { Background };
