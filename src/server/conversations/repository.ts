import { and, asc, desc, eq, isNull, lt, or, sql } from "drizzle-orm";
import type { Db } from "@/db/client";
import { conversations, messageFeedback, messages, type MessageStatus } from "@/db/schema";
import { branchToLeaf } from "@/server/messages/branch";

/** `chat gp` → `chat:* & gp:*` so the sidebar search matches while typing and still uses the GIN index. */
export function buildPrefixQuery(input: string): string | null {
  const words = input.toLowerCase().match(/[\p{L}\p{N}]+/gu);
  return words ? words.map((w) => `${w}:*`).join(" & ") : null;
}

export interface ConversationSummary {
  id: string;
  title: string;
  lastMessageAt: Date;
}

export async function listConversations(db: Db, userId: string, search?: string): Promise<ConversationSummary[]> {
  const tsQuery = search ? buildPrefixQuery(search) : null;
  const matches = tsQuery
    ? or(
        sql`to_tsvector('simple', ${conversations.title}) @@ to_tsquery('simple', ${tsQuery})`,
        sql`exists (select 1 from ${messages} where ${messages.conversationId} = ${conversations.id}
            and to_tsvector('simple', ${messages.content}) @@ to_tsquery('simple', ${tsQuery}))`,
      )
    : undefined;
  return db
    .select({ id: conversations.id, title: conversations.title, lastMessageAt: conversations.lastMessageAt })
    .from(conversations)
    .where(and(eq(conversations.userId, userId), isNull(conversations.deletedAt), matches))
    .orderBy(desc(conversations.lastMessageAt))
    .limit(200);
}

export async function createConversation(db: Db, userId: string): Promise<string> {
  const [row] = await db.insert(conversations).values({ userId }).returning({ id: conversations.id });
  if (!row) throw new Error("conversation insert returned no row");
  return row.id;
}

export async function ownsConversation(db: Db, userId: string, conversationId: string): Promise<boolean> {
  const [row] = await db
    .select({ id: conversations.id })
    .from(conversations)
    .where(
      and(eq(conversations.id, conversationId), eq(conversations.userId, userId), isNull(conversations.deletedAt)),
    );
  return Boolean(row);
}

export async function renameConversation(
  db: Db,
  userId: string,
  conversationId: string,
  title: string,
): Promise<boolean> {
  const rows = await db
    .update(conversations)
    .set({ title })
    .where(and(eq(conversations.id, conversationId), eq(conversations.userId, userId), isNull(conversations.deletedAt)))
    .returning({ id: conversations.id });
  return rows.length > 0;
}

export async function deleteConversation(db: Db, userId: string, conversationId: string): Promise<boolean> {
  const rows = await db
    .update(conversations)
    .set({ deletedAt: new Date() })
    .where(and(eq(conversations.id, conversationId), eq(conversations.userId, userId), isNull(conversations.deletedAt)))
    .returning({ id: conversations.id });
  return rows.length > 0;
}

export async function clearConversations(db: Db, userId: string): Promise<number> {
  const rows = await db
    .update(conversations)
    .set({ deletedAt: new Date() })
    .where(and(eq(conversations.userId, userId), isNull(conversations.deletedAt)))
    .returning({ id: conversations.id });
  return rows.length;
}

/** Retention job: soft-deleted conversations older than the cutoff are removed with their messages. */
export async function purgeDeletedConversations(db: Db, cutoff: Date): Promise<number> {
  const rows = await db
    .delete(conversations)
    .where(lt(conversations.deletedAt, cutoff))
    .returning({ id: conversations.id });
  return rows.length;
}

export interface ThreadMessage {
  id: string;
  parentMessageId: string | null;
  role: "user" | "assistant";
  content: string;
  status: MessageStatus;
  createdAt: Date;
  rating: number | null;
}

export interface Thread {
  id: string;
  title: string;
  isRunning: boolean;
  messages: ThreadMessage[];
}

export async function getThread(db: Db, userId: string, conversationId: string): Promise<Thread | null> {
  const [conversation] = await db
    .select()
    .from(conversations)
    .where(
      and(eq(conversations.id, conversationId), eq(conversations.userId, userId), isNull(conversations.deletedAt)),
    );
  if (!conversation) return null;

  const all = await db
    .select({
      id: messages.id,
      parentMessageId: messages.parentMessageId,
      role: messages.role,
      content: messages.content,
      status: messages.status,
      createdAt: messages.createdAt,
      rating: messageFeedback.rating,
    })
    .from(messages)
    .leftJoin(messageFeedback, and(eq(messageFeedback.messageId, messages.id), eq(messageFeedback.userId, userId)))
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.createdAt));

  return {
    id: conversation.id,
    title: conversation.title,
    isRunning: conversation.activeRunId !== null,
    messages: branchToLeaf(all, conversation.currentLeafMessageId),
  };
}

export async function getLeafId(db: Db, conversationId: string): Promise<string | null> {
  const [row] = await db
    .select({ leaf: conversations.currentLeafMessageId })
    .from(conversations)
    .where(eq(conversations.id, conversationId));
  return row?.leaf ?? null;
}

export async function setLeaf(db: Db, conversationId: string, leafId: string): Promise<void> {
  await db
    .update(conversations)
    .set({ currentLeafMessageId: leafId, lastMessageAt: new Date() })
    .where(eq(conversations.id, conversationId));
}

export async function setTitleIfDefault(
  db: Db,
  conversationId: string,
  title: string,
  previous: string,
): Promise<void> {
  await db
    .update(conversations)
    .set({ title })
    .where(and(eq(conversations.id, conversationId), eq(conversations.title, previous)));
}
