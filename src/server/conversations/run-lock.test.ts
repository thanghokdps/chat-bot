import { sql } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import type { Db } from "@/db/client";
import { createUser, testDb } from "@/test-utils/pglite";
import { createConversation } from "./repository";
import { acquireRun, releaseRun } from "./run-lock";

let db: Db;
const ALICE = "alice";
const BOB = "bob";

beforeEach(async () => {
  db = await testDb();
  await createUser(db, ALICE);
  await createUser(db, BOB);
});

describe("runs", () => {
  it("allows one run per conversation and frees it on release", async () => {
    const id = await createConversation(db, ALICE);
    const run1 = crypto.randomUUID();
    const run2 = crypto.randomUUID();

    expect(await acquireRun(db, { userId: ALICE, conversationId: id, runId: run1 })).toBe(true);
    expect(await acquireRun(db, { userId: ALICE, conversationId: id, runId: run2 })).toBe(false);
    await releaseRun(db, id, run2);
    expect(await acquireRun(db, { userId: ALICE, conversationId: id, runId: run2 })).toBe(false);
    await releaseRun(db, id, run1);
    expect(await acquireRun(db, { userId: ALICE, conversationId: id, runId: run2 })).toBe(true);
  });

  it("takes over a run left by a crashed process", async () => {
    const id = await createConversation(db, ALICE);
    await acquireRun(db, { userId: ALICE, conversationId: id, runId: crypto.randomUUID() });
    await db.execute(sql`update conversations set updated_at = now() - interval '11 minutes' where id = ${id}`);
    expect(await acquireRun(db, { userId: ALICE, conversationId: id, runId: crypto.randomUUID() })).toBe(true);
  });

  it("never lets a user claim someone else's conversation", async () => {
    const id = await createConversation(db, BOB);
    expect(await acquireRun(db, { userId: ALICE, conversationId: id, runId: crypto.randomUUID() })).toBe(false);
  });
});
