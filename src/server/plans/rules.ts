import type { Plan } from "@/db/schema";

export interface PlanInputs {
  trialEndsAt: Date | null;
  liveSubscriptionPlan: Plan | null;
}

export function resolvePlan({ trialEndsAt, liveSubscriptionPlan }: PlanInputs, now: Date): Plan {
  if (liveSubscriptionPlan) return liveSubscriptionPlan;
  if (trialEndsAt && trialEndsAt > now) return "trial";
  return "free";
}

export function startOfUtcDay(now: Date): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}
