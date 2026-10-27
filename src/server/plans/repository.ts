import { and, eq, gte, inArray, sql } from "drizzle-orm";
import type { Db } from "@/db/client";
import { conversations, messages, type Plan, planLimits, subscriptions, user } from "@/db/schema";
import { resolvePlan } from "./rules";

export interface PlanInfo {
  plan: Plan;
  dailyMessages: number;
  modelTier: "standard" | "premium";
}

export async function getPlan(db: Db, userId: string, now: Date): Promise<PlanInfo> {
  const [row] = await db
    .select({ trialEndsAt: user.trialEndsAt, subPlan: subscriptions.plan })
    .from(user)
    .leftJoin(
      subscriptions,
      and(eq(subscriptions.userId, user.id), inArray(subscriptions.status, ["trialing", "active"])),
    )
    .where(eq(user.id, userId));
  const plan = resolvePlan({ trialEndsAt: row?.trialEndsAt ?? null, liveSubscriptionPlan: row?.subPlan ?? null }, now);
  const [limits] = await db.select().from(planLimits).where(eq(planLimits.plan, plan));
  // Fail closed: an unseeded plan table must not mean unlimited usage.
  return limits ?? { plan, dailyMessages: 0, modelTier: "standard" };
}

/** Prompts sent since `since`; a turn whose reply failed is not charged (ADR 0001 decision 9). */
export async function countChargedPrompts(db: Db, userId: string, since: Date): Promise<number> {
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(messages)
    .innerJoin(conversations, eq(conversations.id, messages.conversationId))
    .where(
      and(
        eq(conversations.userId, userId),
        eq(messages.role, "user"),
        gte(messages.createdAt, since),
        sql`not exists (select 1 from ${messages} as reply where reply.parent_message_id = ${messages.id} and reply.status = 'error')`,
      ),
    );
  return row?.n ?? 0;
}
