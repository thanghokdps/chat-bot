import { beforeEach, describe, expect, it } from "vitest";
import type { Db } from "@/db/client";
import { createConversation } from "@/server/conversations/repository";
import { createUser, exchange, testDb } from "@/test-utils/pglite";
import { usageToday } from "./service";

let db: Db;

beforeEach(async () => {
  db = await testDb();
  await createUser(db, "alice");
});

describe("usageToday", () => {
  it("returns the plan's limit with today's charged prompts", async () => {
    const id = await createConversation(db, "alice");
    await exchange(db, id, null, "one", "ok");
    expect(await usageToday(db, "alice", new Date())).toEqual({
      plan: "free",
      dailyMessages: 30,
      modelTier: "standard",
      usedToday: 1,
    });
  });

  it("starts each UTC day at zero", async () => {
    const id = await createConversation(db, "alice");
    await exchange(db, id, null, "one", "ok");
    const tomorrow = new Date(Date.now() + 86_400_000);
    expect((await usageToday(db, "alice", tomorrow)).usedToday).toBe(0);
  });
});
