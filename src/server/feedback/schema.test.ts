import { describe, expect, it } from "vitest";
import { messageIdSchema, ratingSchema } from "./schema";

describe("feedback input", () => {
  it("accepts 1, -1 and null only", () => {
    for (const rating of [1, -1, null]) expect(ratingSchema.safeParse({ rating }).success).toBe(true);
    for (const rating of [0, 2, "1", undefined]) expect(ratingSchema.safeParse({ rating }).success).toBe(false);
  });

  it("accepts uuid message ids only", () => {
    expect(messageIdSchema.safeParse("abc").success).toBe(false);
  });
});
