import type { Db } from "./client";
import { planLimits, promptSuggestions, suggestionCategories } from "./schema";

// Content of the "New chat" grid, verbatim from the Figma screen (typos included where they are UI copy).
const COLUMNS = [
  {
    slug: "explore",
    title: "Explore",
    description: "Learn how to use chat.ai platform for your needs",
    icon: "globe",
    cards: [
      { title: "“Explain”", prompt: "Quantum computing in simple terms", imageUrl: "/suggestions/explain.png" },
      { title: "“How to”", prompt: "Make a search engine platform like google", imageUrl: "/suggestions/how-to.png" },
    ],
  },
  {
    slug: "capabilities",
    title: "Capabilities",
    description: "How much capable chat.ai to full-fill your needs",
    icon: "bolt",
    cards: [
      { title: "“Remember”", prompt: "quantum computing in simple terms", imageUrl: "/suggestions/remember.png" },
      { title: "“Allows”", prompt: "User to provide follow-up corrections", imageUrl: "/suggestions/allows.png" },
    ],
  },
  {
    slug: "limitation",
    title: "Limitation",
    description: "How much capable chat.ai to full-fill your needs",
    icon: "warning",
    cards: [
      { title: "“May”", prompt: "Occasionally generate incorrect information", imageUrl: "/suggestions/may.png" },
      { title: "“Limited”", prompt: "Knowledge of world and events after 2021", imageUrl: "/suggestions/limited.png" },
    ],
  },
] as const;

export const PLAN_LIMITS = [
  { plan: "free", dailyMessages: 30, modelTier: "standard" },
  { plan: "trial", dailyMessages: 30, modelTier: "standard" },
  { plan: "pro", dailyMessages: 500, modelTier: "premium" },
] as const;

/** Idempotent: safe to run on every deploy. */
export async function seed(db: Db): Promise<void> {
  await db
    .insert(planLimits)
    .values([...PLAN_LIMITS])
    .onConflictDoNothing();

  for (const [i, column] of COLUMNS.entries()) {
    const [category] = await db
      .insert(suggestionCategories)
      .values({
        slug: column.slug,
        title: column.title,
        description: column.description,
        icon: column.icon,
        sortOrder: i,
      })
      .onConflictDoNothing()
      .returning({ id: suggestionCategories.id });
    if (!category) continue;
    await db
      .insert(promptSuggestions)
      .values(column.cards.map((card, j) => ({ ...card, categoryId: category.id, sortOrder: j })));
  }
}
