import type { ConversationGroup } from "@/lib/types";

const DAY_MS = 86_400_000;

/** Sidebar sections: "Your conversations" (today), "Last 7 Days", then older. */
export function conversationGroup(lastMessageAt: Date, now: Date): ConversationGroup {
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const t = lastMessageAt.getTime();
  if (t >= startOfToday) return "today";
  if (t >= startOfToday - 7 * DAY_MS) return "last7Days";
  return "older";
}
