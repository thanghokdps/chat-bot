import { and, eq, isNull, lt, or, sql } from "drizzle-orm";
import type { Db } from "@/db/client";
import { conversations } from "@/db/schema";

// A run older than this is treated as crashed, so a dead process cannot lock a conversation forever.
const STALE_RUN_MINUTES = 10;

/** Atomic claim: succeeds only when no live run holds the conversation (ADR 0001 decision 7). */
export async function acquireRun(
  db: Db,
  { userId, conversationId, runId }: { userId: string; conversationId: string; runId: string },
): Promise<boolean> {
  const rows = await db
    .update(conversations)
    .set({ activeRunId: runId })
    .where(
      and(
        eq(conversations.id, conversationId),
        eq(conversations.userId, userId),
        isNull(conversations.deletedAt),
        or(
          isNull(conversations.activeRunId),
          lt(conversations.updatedAt, sql`now() - make_interval(mins => ${STALE_RUN_MINUTES})`),
        ),
      ),
    )
    .returning({ id: conversations.id });
  return rows.length > 0;
}

export async function releaseRun(db: Db, conversationId: string, runId: string): Promise<void> {
  await db
    .update(conversations)
    .set({ activeRunId: null })
    .where(and(eq(conversations.id, conversationId), eq(conversations.activeRunId, runId)));
}
