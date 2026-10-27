import type { Db } from "@/db/client";
import { countChargedPrompts, getPlan, type PlanInfo } from "./repository";
import { startOfUtcDay } from "./rules";

/** The caller's plan and how much of today's quota is spent (quota resets at 00:00 UTC). */
export async function usageToday(db: Db, userId: string, now: Date): Promise<PlanInfo & { usedToday: number }> {
  const [plan, usedToday] = await Promise.all([
    getPlan(db, userId, now),
    countChargedPrompts(db, userId, startOfUtcDay(now)),
  ]);
  return { ...plan, usedToday };
}
