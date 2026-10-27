import { beforeEach, describe, expect, it } from "vitest";
import type { Db } from "@/db/client";
import { createConversation, getThread } from "@/server/conversations/repository";
import { createUser, exchange, testDb } from "@/test-utils/pglite";
import { setFeedback } from "./repository";

let db: Db;
const ALICE = "alice";
const BOB = "bob";

beforeEach(async () => {
  db = await testDb();
  await createUser(db, ALICE);
  await createUser(db, BOB);
});

describe("feedback", () => {
  it("toggles a vote on the caller's assistant reply only", async () => {
    const id = await createConversation(db, ALICE);
    const { u, a } = await exchange(db, id, null, "q", "a");

    expect(await setFeedback(db, { userId: ALICE, messageId: a, rating: 1 })).toBe(true);
    expect(await setFeedback(db, { userId: ALICE, messageId: a, rating: -1 })).toBe(true);
    expect((await getThread(db, ALICE, id))?.messages[1]?.rating).toBe(-1);
    expect(await setFeedback(db, { userId: ALICE, messageId: a, rating: null })).toBe(true);
    expect((await getThread(db, ALICE, id))?.messages[1]?.rating).toBeNull();

    expect(await setFeedback(db, { userId: BOB, messageId: a, rating: 1 })).toBe(false);
    expect(await setFeedback(db, { userId: ALICE, messageId: u, rating: 1 })).toBe(false);
  });
});
