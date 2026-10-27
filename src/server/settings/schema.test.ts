import { describe, expect, it } from "vitest";
import { settingsPatchSchema } from "./schema";

describe("settings patch", () => {
  it("accepts a partial patch of known fields", () => {
    expect(settingsPatchSchema.parse({ background: "green" })).toEqual({ background: "green" });
  });

  it("rejects unknown backgrounds and extra keys such as a user id", () => {
    expect(settingsPatchSchema.safeParse({ background: "purple" }).success).toBe(false);
    expect(settingsPatchSchema.safeParse({ background: "gray", userId: "bob" }).success).toBe(false);
  });
});
