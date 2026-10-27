import { beforeEach, describe, expect, it } from "vitest";
import type { Db } from "@/db/client";
import { createUser, testDb } from "@/test-utils/pglite";
import { listSuggestions } from "./repository";

let db: Db;
const ALICE = "alice";
const BOB = "bob";

beforeEach(async () => {
  db = await testDb();
  await createUser(db, ALICE);
  await createUser(db, BOB);
});

describe("suggestions", () => {
  it("returns the design's 3 × 2 suggestion grid in order", async () => {
    const columns = await listSuggestions(db);
    expect(columns.map((c) => c.title)).toEqual(["Explore", "Capabilities", "Limitation"]);
    expect(columns.map((c) => c.cards.length)).toEqual([2, 2, 2]);
    expect(columns[0]?.cards[0]?.prompt).toBe("Quantum computing in simple terms");
  });
});
