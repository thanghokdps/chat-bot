import { describe, expect, it } from "vitest";
import { conversationIdSchema, renameSchema } from "./schema";

describe("conversation input", () => {
  it("accepts uuids only", () => {
    expect(conversationIdSchema.safeParse(crypto.randomUUID()).success).toBe(true);
    expect(conversationIdSchema.safeParse("1 or 1=1").success).toBe(false);
  });

  it("trims titles and bounds them to 1–80 characters", () => {
    expect(renameSchema.parse({ title: "  Plan  " })).toEqual({ title: "Plan" });
    expect(renameSchema.safeParse({ title: "   " }).success).toBe(false);
    expect(renameSchema.safeParse({ title: "x".repeat(81) }).success).toBe(false);
  });
});
