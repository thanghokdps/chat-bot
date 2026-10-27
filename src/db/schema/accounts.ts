import { sql } from "drizzle-orm";
import { integer, pgTable, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { BACKGROUNDS } from "@/lib/backgrounds";
import { user } from "./auth";
import { createdAt, ts, updatedAt } from "./columns";

export const userSettings = pgTable("user_settings", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  theme: text("theme", { enum: ["light", "dark", "system"] })
    .notNull()
    .default("light"),
  background: text("background", { enum: BACKGROUNDS }).notNull().default("gray"),
  language: text("language").notNull().default("en"),
  updatedAt: updatedAt(),
});

export const PLANS = ["free", "trial", "pro"] as const;
export type Plan = (typeof PLANS)[number];

export const planLimits = pgTable("plan_limits", {
  plan: text("plan", { enum: PLANS }).primaryKey(),
  dailyMessages: integer("daily_messages").notNull(),
  modelTier: text("model_tier", { enum: ["standard", "premium"] }).notNull(),
});

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    plan: text("plan", { enum: PLANS })
      .notNull()
      .references(() => planLimits.plan),
    status: text("status", { enum: ["trialing", "active", "past_due", "canceled"] }).notNull(),
    provider: text("provider"),
    providerSubscriptionId: text("provider_subscription_id").unique(),
    currentPeriodEnd: ts("current_period_end"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("subscriptions_one_live_uq")
      .on(t.userId)
      .where(sql`${t.status} in ('trialing', 'active')`),
  ],
);
