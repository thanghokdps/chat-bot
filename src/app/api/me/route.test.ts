import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Db } from "@/db/client";
import { createConversation } from "@/server/conversations/repository";
import { createUser, exchange, testDb } from "@/test-utils/pglite";
import { request, signInAs } from "@/test-utils/route";

let db: Db;
vi.mock("@/agent/identity", async () => (await import("@/test-utils/route")).identityMock());
vi.mock("@/db/client", () => ({ db: () => db }));
const { GET } = await import("./route");

beforeEach(async () => {
  db = await testDb();
  await createUser(db, "alice");
  signInAs("alice");
});

describe("GET /api/me", () => {
  it("returns the caller, plan limit and today's usage", async () => {
    await exchange(db, await createConversation(db, "alice"), null, "q", "a");
    expect(await (await GET(request("/api/me"))).json()).toEqual({
      user: { id: "alice", name: "alice", email: "alice@example.com", image: null },
      plan: "free",
      dailyMessages: 30,
      usedToday: 1,
    });
  });

  it("needs a session", async () => {
    signInAs(null);
    expect((await GET(request("/api/me"))).status).toBe(401);
  });
});
