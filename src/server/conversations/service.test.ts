import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import type { Db } from "@/db/client";
import { conversations } from "@/db/schema";
import { createUser, testDb } from "@/test-utils/pglite";
import { createConversation } from "./repository";
import { listSidebar } from "./service";

let db: Db;

beforeEach(async () => {
  db = await testDb();
  await createUser(db, "alice");
});

describe("listSidebar", () => {
  it("puts each conversation in its sidebar section relative to now", async () => {
    const today = await createConversation(db, "alice");
    const old = await createConversation(db, "alice");
    await db
      .update(conversations)
      .set({ lastMessageAt: new Date("2026-01-01T12:00:00") })
      .where(eq(conversations.id, old));
    const items = await listSidebar(db, { userId: "alice", search: undefined, now: new Date() });
    expect(items.map((c) => [c.id, c.group])).toEqual([
      [today, "today"],
      [old, "older"],
    ]);
  });

  it("returns nothing for a search that matches nothing", async () => {
    await createConversation(db, "alice");
    expect(await listSidebar(db, { userId: "alice", search: "zzz", now: new Date() })).toEqual([]);
  });
});
