import { beforeEach, describe, expect, it } from "vitest";
import type { Db } from "@/db/client";
import { createUser, testDb } from "@/test-utils/pglite";
import { getSettings, updateSettings } from "./repository";

let db: Db;
const ALICE = "alice";
const BOB = "bob";

beforeEach(async () => {
  db = await testDb();
  await createUser(db, ALICE);
  await createUser(db, BOB);
});

describe("settings", () => {
  it("defaults, then upserts settings", async () => {
    expect((await getSettings(db, ALICE)).background).toBe("gray");
    await updateSettings(db, ALICE, { background: "pink" });
    expect(await updateSettings(db, ALICE, { theme: "dark" })).toEqual({
      theme: "dark",
      background: "pink",
      language: "en",
    });
  });
});
