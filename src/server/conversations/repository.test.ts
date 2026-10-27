import { sql } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import type { Db } from "@/db/client";
import { conversations } from "@/db/schema";
import { insertMessage, loadBranch } from "@/server/messages/repository";
import { createUser, exchange, testDb } from "@/test-utils/pglite";
import {
  buildPrefixQuery,
  clearConversations,
  createConversation,
  deleteConversation,
  getThread,
  listConversations,
  purgeDeletedConversations,
  renameConversation,
  setLeaf,
} from "./repository";

let db: Db;
const ALICE = "alice";
const BOB = "bob";

beforeEach(async () => {
  db = await testDb();
  await createUser(db, ALICE);
  await createUser(db, BOB);
});

describe("buildPrefixQuery", () => {
  it("turns words into prefix terms and drops tsquery syntax", () => {
    expect(buildPrefixQuery("Chat GP")).toBe("chat:* & gp:*");
    expect(buildPrefixQuery("a & b | !c")).toBe("a:* & b:* & c:*");
    expect(buildPrefixQuery("  !! ")).toBeNull();
  });
});

describe("conversations", () => {
  it("lists only the caller's live conversations, newest first", async () => {
    const older = await createConversation(db, ALICE);
    const newer = await createConversation(db, ALICE);
    await createConversation(db, BOB);
    await db
      .update(conversations)
      .set({ lastMessageAt: new Date("2026-01-01") })
      .where(sql`id = ${older}`);

    expect((await listConversations(db, ALICE)).map((c) => c.id)).toEqual([newer, older]);
  });

  it("searches titles and message content by prefix", async () => {
    const byTitle = await createConversation(db, ALICE);
    await renameConversation(db, ALICE, byTitle, "Create POS System");
    const byContent = await createConversation(db, ALICE);
    await exchange(db, byContent, null, "What is a binary DFA?", "A deterministic finite automaton...");

    expect((await listConversations(db, ALICE, "pos")).map((c) => c.id)).toEqual([byTitle]);
    expect((await listConversations(db, ALICE, "determin")).map((c) => c.id)).toEqual([byContent]);
  });

  it("refuses rename and delete of another user's conversation", async () => {
    const id = await createConversation(db, BOB);
    expect(await renameConversation(db, ALICE, id, "mine now")).toBe(false);
    expect(await deleteConversation(db, ALICE, id)).toBe(false);
    expect(await getThread(db, ALICE, id)).toBeNull();
  });

  it("clear all soft-deletes, and the retention job purges after the cutoff", async () => {
    await createConversation(db, ALICE);
    await createConversation(db, ALICE);
    await createConversation(db, BOB);

    expect(await clearConversations(db, ALICE)).toBe(2);
    expect(await listConversations(db, ALICE)).toEqual([]);
    expect(await listConversations(db, BOB)).toHaveLength(1);
    expect(await purgeDeletedConversations(db, new Date(Date.now() - 60_000))).toBe(0);
    expect(await purgeDeletedConversations(db, new Date(Date.now() + 60_000))).toBe(2);
  });
});

describe("thread branches", () => {
  it("shows the current branch after regenerate and edit, and the model sees only that branch", async () => {
    const id = await createConversation(db, ALICE);
    const first = await exchange(db, id, null, "Create a chatbot", "Steps 1-4");
    const second = await exchange(db, id, first.a, "What is use of that chatbot ?", "Uses...");
    const regenerated = await insertMessage(db, {
      conversationId: id,
      parentMessageId: second.u,
      role: "assistant",
      content: "Uses v2",
      status: "complete",
    });
    await setLeaf(db, id, regenerated);

    expect((await getThread(db, ALICE, id))?.messages.map((m) => m.content)).toEqual([
      "Create a chatbot",
      "Steps 1-4",
      "What is use of that chatbot ?",
      "Uses v2",
    ]);

    const edited = await exchange(db, id, first.a, "Who uses chatbots?", "Support teams...");
    expect((await loadBranch(db, id, edited.u)).map((m) => m.content)).toEqual([
      "Create a chatbot",
      "Steps 1-4",
      "Who uses chatbots?",
    ]);
  });
});
