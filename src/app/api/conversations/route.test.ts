import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Db } from "@/db/client";
import { createConversation } from "@/server/conversations/repository";
import { createUser, testDb } from "@/test-utils/pglite";
import { request, signInAs } from "@/test-utils/route";

let db: Db;
vi.mock("@/agent/identity", async () => (await import("@/test-utils/route")).identityMock());
vi.mock("@/db/client", () => ({ db: () => db }));
const { DELETE, GET, POST } = await import("./route");

beforeEach(async () => {
  db = await testDb();
  await createUser(db, "alice");
  await createUser(db, "bob");
  signInAs("alice");
});

describe("/api/conversations", () => {
  it("rejects a signed-out caller on every method", async () => {
    signInAs(null);
    for (const handler of [GET, POST, DELETE]) {
      const res = await handler(request("/api/conversations", { method: "POST" }));
      expect(res.status).toBe(401);
      expect(await res.json()).toEqual({ error: "unauthorized" });
    }
  });

  it("creates, lists with sidebar groups, and searches only the caller's conversations", async () => {
    const created = await POST(request("/api/conversations", { method: "POST" }));
    expect(created.status).toBe(201);
    const { id } = (await created.json()) as { id: string };
    await createConversation(db, "bob");

    const list = (await (await GET(request("/api/conversations"))).json()) as {
      conversations: { id: string; group: string }[];
    };
    expect(list.conversations.map((c) => [c.id, c.group])).toEqual([[id, "today"]]);
    const none = (await (await GET(request("/api/conversations?q=nothing"))).json()) as { conversations: unknown[] };
    expect(none.conversations).toEqual([]);
  });

  it("clears only the caller's conversations", async () => {
    await createConversation(db, "alice");
    await createConversation(db, "bob");
    expect(await (await DELETE(request("/api/conversations", { method: "DELETE" }))).json()).toEqual({ cleared: 1 });
  });
});
