import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Db } from "@/db/client";
import { createUser, testDb } from "@/test-utils/pglite";
import { request, signInAs } from "@/test-utils/route";

let db: Db;
vi.mock("@/agent/identity", async () => (await import("@/test-utils/route")).identityMock());
vi.mock("@/db/client", () => ({ db: () => db }));
const { GET, PATCH } = await import("./route");

beforeEach(async () => {
  db = await testDb();
  await createUser(db, "alice");
  signInAs("alice");
});

const patch = (body: unknown) => PATCH(request("/api/settings", { method: "PATCH", body }));

describe("/api/settings", () => {
  it("returns defaults, then the saved background", async () => {
    expect(await (await GET(request("/api/settings"))).json()).toMatchObject({ background: "gray" });
    expect(await (await patch({ background: "pink" })).json()).toMatchObject({ background: "pink" });
    expect(await (await GET(request("/api/settings"))).json()).toMatchObject({ background: "pink" });
  });

  it("rejects unknown backgrounds and unknown fields", async () => {
    expect((await patch({ background: "purple" })).status).toBe(400);
    expect((await patch({ userId: "bob" })).status).toBe(400);
  });

  it("needs a session", async () => {
    signInAs(null);
    expect((await GET(request("/api/settings"))).status).toBe(401);
  });
});
