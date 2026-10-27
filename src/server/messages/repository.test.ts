import { beforeEach, describe, expect, it } from "vitest";
import type { Db } from "@/db/client";
import { createConversation, getThread, setLeaf } from "@/server/conversations/repository";
import { createUser, testDb } from "@/test-utils/pglite";
import { finishMessage, getMessage, insertMessage, loadBranch } from "./repository";

let db: Db;
let conversationId: string;

beforeEach(async () => {
  db = await testDb();
  await createUser(db, "alice");
  conversationId = await createConversation(db, "alice");
});

const prompt = (content: string, parentMessageId: string | null = null) =>
  insertMessage(db, { conversationId, parentMessageId, role: "user", content, status: "complete" });

describe("messages", () => {
  it("finds a message only inside its own conversation", async () => {
    const id = await prompt("hi");
    expect(await getMessage(db, conversationId, id)).toMatchObject({ content: "hi", role: "user" });
    const other = await createConversation(db, "alice");
    expect(await getMessage(db, other, id)).toBeNull();
  });

  it("finishes a streaming reply with its final text, status and model", async () => {
    const u = await prompt("hi");
    const a = await insertMessage(db, {
      conversationId,
      parentMessageId: u,
      role: "assistant",
      content: "",
      status: "streaming",
    });
    await finishMessage(db, a, { content: "Hello!", status: "complete", model: "gpt-x", outputTokens: 3 });
    await setLeaf(db, conversationId, a);
    expect((await getThread(db, "alice", conversationId))?.messages.at(-1)).toMatchObject({
      content: "Hello!",
      status: "complete",
    });
  });

  it("leaves failed replies out of model history", async () => {
    const u = await prompt("hi");
    const failed = await insertMessage(db, {
      conversationId,
      parentMessageId: u,
      role: "assistant",
      content: "Something went wrong",
      status: "error",
    });
    expect((await loadBranch(db, conversationId, failed)).map((m) => m.content)).toEqual(["hi"]);
  });
});
