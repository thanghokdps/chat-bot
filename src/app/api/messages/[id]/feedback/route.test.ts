import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Db } from "@/db/client";
import { createConversation } from "@/server/conversations/repository";
import { createUser, exchange, testDb } from "@/test-utils/pglite";
import { params, request, signInAs } from "@/test-utils/route";

let db: Db;
vi.mock("@/agent/identity", async () => (await import("@/test-utils/route")).identityMock());
vi.mock("@/db/client", () => ({ db: () => db }));
const { PUT } = await import("./route");

let answer: string;

beforeEach(async () => {
  db = await testDb();
  await createUser(db, "alice");
  await createUser(db, "bob");
  ({ a: answer } = await exchange(db, await createConversation(db, "alice"), null, "q", "a"));
  signInAs("alice");
});

const vote = (id: string, body: unknown) =>
  PUT(request(`/api/messages/${id}/feedback`, { method: "PUT", body }), params({ id }));

describe("PUT /api/messages/:id/feedback", () => {
  it("stores and clears the caller's vote", async () => {
    expect(await (await vote(answer, { rating: 1 })).json()).toEqual({ rating: 1 });
    expect(await (await vote(answer, { rating: null })).json()).toEqual({ rating: null });
  });

  it("rejects ratings other than 1, -1 or null", async () => {
    expect((await vote(answer, { rating: 5 })).status).toBe(400);
  });

  it("hides another user's message as 404 and needs a session", async () => {
    signInAs("bob");
    expect((await vote(answer, { rating: 1 })).status).toBe(404);
    signInAs(null);
    expect((await vote(answer, { rating: 1 })).status).toBe(401);
  });
});
