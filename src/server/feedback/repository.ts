import { and, eq, isNull } from "drizzle-orm";
import type { Db } from "@/db/client";
import { conversations, messageFeedback, messages } from "@/db/schema";

/** rating null clears the vote; returns false when the message is not the caller's assistant reply. */
export async function setFeedback(
  db: Db,
  { userId, messageId, rating }: { userId: string; messageId: string; rating: 1 | -1 | null },
): Promise<boolean> {
  const [owned] = await db
    .select({ id: messages.id })
    .from(messages)
    .innerJoin(conversations, eq(conversations.id, messages.conversationId))
    .where(
      and(
        eq(messages.id, messageId),
        eq(messages.role, "assistant"),
        eq(conversations.userId, userId),
        isNull(conversations.deletedAt),
      ),
    );
  if (!owned) return false;
  if (rating === null) {
    await db
      .delete(messageFeedback)
      .where(and(eq(messageFeedback.messageId, messageId), eq(messageFeedback.userId, userId)));
    return true;
  }
  await db
    .insert(messageFeedback)
    .values({ messageId, userId, rating })
    .onConflictDoUpdate({ target: [messageFeedback.messageId, messageFeedback.userId], set: { rating } });
  return true;
}
