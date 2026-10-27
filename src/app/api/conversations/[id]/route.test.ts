import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Db } from "@/db/client";
import { createConversation } from "@/server/conversations/repository";
import { createUser, exchange, testDb } from "@/test-utils/pglite";
import { params, request, signInAs } from "@/test-utils/route";

let db: Db;
vi.mock("@/agent/identity", async () => (await import("@/test-utils/route")).identityMock());
vi.mock("@/db/client", () => ({ db: () => db }));
const { DELETE, GET, PATCH } = await import("./route");

let mine: string;
let bobs: string;

beforeEach(async () => {
  db = await testDb();
  await createUser(db, "alice");
  await createUser(db, "bob");
  mine = await createConversation(db, "alice");
  bobs = await createConversation(db, "bob");
  signInAs("alice");
});

const path = (id: string) => `/api/conversations/${id}`;

describe("/api/conversations/:id", () => {
  it("returns the caller's thread on its current branch", async () => {
    await exchange(db, mine, null, "hi", "hello");
    const res = await GET(request(path(mine)), params({ id: mine }));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { messages: { content: string }[] };
    expect(body.messages.map((m) => m.content)).toEqual(["hi", "hello"]);
  });

  it("answers 404 for another user's conversation, a bad id, or no session → 401", async () => {
    expect((await GET(request(path(bobs)), params({ id: bobs }))).status).toBe(404);
    expect((await GET(request(path("not-a-uuid")), params({ id: "not-a-uuid" }))).status).toBe(404);
    expect(
      (await PATCH(request(path(bobs), { method: "PATCH", body: { title: "x" } }), params({ id: bobs }))).status,
    ).toBe(404);
    expect((await DELETE(request(path(bobs), { method: "DELETE" }), params({ id: bobs }))).status).toBe(404);
    signInAs(null);
    expect((await GET(request(path(mine)), params({ id: mine }))).status).toBe(401);
  });

  it("renames with a trimmed title and rejects an empty or malformed body", async () => {
    const ok = await PATCH(
      request(path(mine), { method: "PATCH", body: { title: "  Trip plan  " } }),
      params({ id: mine }),
    );
    expect(await ok.json()).toEqual({ title: "Trip plan" });
    const empty = await PATCH(request(path(mine), { method: "PATCH", body: { title: "   " } }), params({ id: mine }));
    expect(empty.status).toBe(400);
    const broken = await PATCH(request(path(mine), { method: "PATCH", body: "{not json" }), params({ id: mine }));
    expect(await broken.json()).toEqual({ error: "invalid_body" });
  });

  it("deletes once, then the conversation is gone", async () => {
    expect((await DELETE(request(path(mine), { method: "DELETE" }), params({ id: mine }))).status).toBe(204);
    expect((await GET(request(path(mine)), params({ id: mine }))).status).toBe(404);
  });
});
