import { describe, expect, it } from "vitest";
import { resolvePlan, startOfUtcDay } from "./rules";

describe("resolvePlan", () => {
  const now = new Date("2026-10-22T00:00:00Z");

  it("prefers a live subscription", () => {
    expect(resolvePlan({ trialEndsAt: null, liveSubscriptionPlan: "pro" }, now)).toBe("pro");
  });

  it("is trial until the trial ends, then free", () => {
    expect(resolvePlan({ trialEndsAt: new Date("2026-10-25"), liveSubscriptionPlan: null }, now)).toBe("trial");
    expect(resolvePlan({ trialEndsAt: new Date("2026-10-21"), liveSubscriptionPlan: null }, now)).toBe("free");
    expect(resolvePlan({ trialEndsAt: null, liveSubscriptionPlan: null }, now)).toBe("free");
  });
});

describe("startOfUtcDay", () => {
  it("truncates to midnight UTC", () => {
    expect(startOfUtcDay(new Date("2026-10-22T18:30:00Z")).toISOString()).toBe("2026-10-22T00:00:00.000Z");
  });
});
