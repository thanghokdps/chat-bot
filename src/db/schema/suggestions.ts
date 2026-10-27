import { boolean, integer, pgTable, text, uuid } from "drizzle-orm/pg-core";

export const suggestionCategories = pgTable("suggestion_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon", { enum: ["globe", "bolt", "warning"] }).notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const promptSuggestions = pgTable("prompt_suggestions", {
  id: uuid("id").primaryKey().defaultRandom(),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => suggestionCategories.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  prompt: text("prompt").notNull(),
  imageUrl: text("image_url"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});
