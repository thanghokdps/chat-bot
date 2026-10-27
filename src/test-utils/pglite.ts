import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import type { Db } from "@/db/client";
import { tables, user } from "@/db/schema";
import { seed } from "@/db/seed";
import { setLeaf } from "@/server/conversations/repository";
import { insertMessage } from "@/server/messages/repository";

/** A fresh in-memory Postgres with the real migrations and seed applied. */
export async function testDb(): Promise<Db> {
  const db = drizzle(new PGlite(), { schema: tables });
  await migrate(db, { migrationsFolder: "drizzle" });
  await seed(db);
  return db;
}

export async function createUser(db: Db, id: string, overrides: { trialEndsAt?: Date | null } = {}): Promise<string> {
  await db
    .insert(user)
    .values({ id, name: id, email: `${id}@example.com`, trialEndsAt: overrides.trialEndsAt ?? null });
  return id;
}

/** One prompt and its completed reply, made the conversation's current leaf. */
export async function exchange(
  db: Db,
  conversationId: string,
  parent: string | null,
  prompt: string,
  answer: string,
): Promise<{ u: string; a: string }> {
  const u = await insertMessage(db, {
    conversationId,
    parentMessageId: parent,
    role: "user",
    content: prompt,
    status: "complete",
  });
  const a = await insertMessage(db, {
    conversationId,
    parentMessageId: u,
    role: "assistant",
    content: answer,
    status: "complete",
  });
  await setLeaf(db, conversationId, a);
  return { u, a };
}
