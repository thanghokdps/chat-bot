import { sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  bigint,
  check,
  index,
  integer,
  pgTable,
  smallint,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { createdAt, ts, updatedAt } from "./columns";

export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull().default("New chat"),
    currentLeafMessageId: uuid("current_leaf_message_id").references((): AnyPgColumn => messages.id, {
      onDelete: "set null",
    }),
    activeRunId: uuid("active_run_id"),
    lastMessageAt: ts("last_message_at").notNull().defaultNow(),
    deletedAt: ts("deleted_at"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("conversations_sidebar_idx").on(t.userId, t.deletedAt, t.lastMessageAt.desc()),
    index("conversations_title_fts").using("gin", sql`to_tsvector('simple', ${t.title})`),
  ],
);

export const MESSAGE_STATUSES = ["streaming", "complete", "stopped", "error"] as const;
export type MessageStatus = (typeof MESSAGE_STATUSES)[number];

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    parentMessageId: uuid("parent_message_id").references((): AnyPgColumn => messages.id, { onDelete: "cascade" }),
    role: text("role", { enum: ["user", "assistant"] }).notNull(),
    content: text("content").notNull(),
    status: text("status", { enum: MESSAGE_STATUSES }).notNull().default("complete"),
    model: text("model"),
    inputTokens: integer("input_tokens"),
    outputTokens: integer("output_tokens"),
    createdAt: createdAt(),
  },
  (t) => [
    index("messages_thread_idx").on(t.conversationId, t.createdAt),
    index("messages_parent_idx").on(t.parentMessageId),
    index("messages_content_fts").using("gin", sql`to_tsvector('simple', ${t.content})`),
    index("messages_user_quota_idx")
      .on(t.conversationId, t.createdAt)
      .where(sql`${t.role} = 'user'`),
  ],
);

export const attachments = pgTable("attachments", {
  id: uuid("id").primaryKey().defaultRandom(),
  messageId: uuid("message_id")
    .notNull()
    .references(() => messages.id, { onDelete: "cascade" }),
  kind: text("kind", { enum: ["image"] }).notNull(),
  storageKey: text("storage_key").notNull(),
  mimeType: text("mime_type").notNull(),
  sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(),
  createdAt: createdAt(),
});

export const messageFeedback = pgTable(
  "message_feedback",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    messageId: uuid("message_id")
      .notNull()
      .references(() => messages.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    rating: smallint("rating").notNull(),
    comment: text("comment"),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex("message_feedback_uq").on(t.messageId, t.userId),
    check("message_feedback_rating_ck", sql`${t.rating} in (-1, 1)`),
  ],
);
