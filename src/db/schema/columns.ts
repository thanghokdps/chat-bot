import { timestamp } from "drizzle-orm/pg-core";

// Columns and relationships mirror docs/erd.md; change both together.
export const ts = (name: string) => timestamp(name, { withTimezone: true });
export const createdAt = () => ts("created_at").notNull().defaultNow();
export const updatedAt = () =>
  ts("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());
