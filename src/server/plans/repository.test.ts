import { beforeEach, describe, expect, it } from "vitest";
import type { Db } from "@/db/client";
import { subscriptions } from "@/db/schema";
import { createConversation } from "@/server/conversations/repository";
import { insertMessage } from "@/server/messages/repository";
import { createUser, exchange, testDb } from "@/test-utils/pglite";
import { countChargedPrompts, getPlan } from "./repository";

let db: Db;
const ALICE = "alice";
const BOB = "bob";

beforeEach(async () => {
  db = await testDb();
  await createUser(db, ALICE);
  await createUser(db, BOB);
});

describe("plans and quota", () => {
  const now = new Date();

  it("resolves free, trial and pro limits from the seeded table", async () => {
    expect(await getPlan(db, ALICE, now)).toEqual({ plan: "free", dailyMessages: 30, modelTier: "standard" });
    await createUser(db, "trialist", { trialEndsAt: new Date(Date.now() + 86_400_000) });
    expect((await getPlan(db, "trialist", now)).plan).toBe("trial");
    await db.insert(subscriptions).values({ userId: BOB, plan: "pro", status: "active" });
    expect(await getPlan(db, BOB, now)).toEqual({ plan: "pro", dailyMessages: 500, modelTier: "premium" });
  });

  it("counts the caller's prompts since a time, excluding failed turns", async () => {
    const id = await createConversation(db, ALICE);
    await exchange(db, id, null, "one", "ok");
    const u = await insertMessage(db, {
      conversationId: id,
      parentMessageId: null,
      role: "user",
      content: "two",
      status: "complete",
    });
    await insertMessage(db, {
      conversationId: id,
      parentMessageId: u,
      role: "assistant",
      content: "x",
      status: "error",
    });
    const bobs = await createConversation(db, BOB);
    await exchange(db, bobs, null, "bob", "ok");

    expect(await countChargedPrompts(db, ALICE, new Date(Date.now() - 60_000))).toBe(1);
    expect(await countChargedPrompts(db, ALICE, new Date(Date.now() + 60_000))).toBe(0);
  });
});
