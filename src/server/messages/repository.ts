import { and, eq } from "drizzle-orm";
import type { Db } from "@/db/client";
import { messages, type MessageStatus } from "@/db/schema";
import { branchToLeaf } from "./branch";

export interface StoredMessage {
  id: string;
  parentMessageId: string | null;
  role: "user" | "assistant";
  content: string;
}

export async function getMessage(db: Db, conversationId: string, messageId: string): Promise<StoredMessage | null> {
  const [row] = await db
    .select({
      id: messages.id,
      parentMessageId: messages.parentMessageId,
      role: messages.role,
      content: messages.content,
    })
    .from(messages)
    .where(and(eq(messages.id, messageId), eq(messages.conversationId, conversationId)));
  return row ?? null;
}

/** History the model sees: the branch ending at `leafId`, completed turns only. */
export async function loadBranch(db: Db, conversationId: string, leafId: string): Promise<StoredMessage[]> {
  const all = await db
    .select({
      id: messages.id,
      parentMessageId: messages.parentMessageId,
      role: messages.role,
      content: messages.content,
      status: messages.status,
    })
    .from(messages)
    .where(eq(messages.conversationId, conversationId));
  return branchToLeaf(all, leafId).filter((m) => m.role === "user" || m.status !== "error");
}

export async function insertMessage(
  db: Db,
  values: {
    conversationId: string;
    parentMessageId: string | null;
    role: "user" | "assistant";
    content: string;
    status: MessageStatus;
  },
): Promise<string> {
  const [row] = await db.insert(messages).values(values).returning({ id: messages.id });
  if (!row) throw new Error("message insert returned no row");
  return row.id;
}

export async function finishMessage(
  db: Db,
  messageId: string,
  values: { content: string; status: MessageStatus; model?: string; inputTokens?: number; outputTokens?: number },
): Promise<void> {
  await db.update(messages).set(values).where(eq(messages.id, messageId));
}
