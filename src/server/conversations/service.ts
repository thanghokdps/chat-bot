import type { Db } from "@/db/client";
import type { ConversationGroup } from "@/lib/types";
import { conversationGroup } from "./grouping";
import { type ConversationSummary, listConversations } from "./repository";

/** Sidebar rows: the caller's conversations with the section each one falls in. */
export async function listSidebar(
  db: Db,
  { userId, search, now }: { userId: string; search: string | undefined; now: Date },
): Promise<(ConversationSummary & { group: ConversationGroup })[]> {
  const items = await listConversations(db, userId, search);
  return items.map((c) => ({ ...c, group: conversationGroup(c.lastMessageAt, now) }));
}
