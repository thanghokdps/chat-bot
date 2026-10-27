import { and, asc, eq } from "drizzle-orm";
import type { Db } from "@/db/client";
import { promptSuggestions, suggestionCategories } from "@/db/schema";

export interface SuggestionColumn {
  slug: string;
  title: string;
  description: string;
  icon: "globe" | "bolt" | "warning";
  cards: { id: string; title: string; prompt: string; imageUrl: string | null }[];
}

export async function listSuggestions(db: Db): Promise<SuggestionColumn[]> {
  const rows = await db
    .select({
      category: suggestionCategories,
      card: {
        id: promptSuggestions.id,
        title: promptSuggestions.title,
        prompt: promptSuggestions.prompt,
        imageUrl: promptSuggestions.imageUrl,
      },
    })
    .from(suggestionCategories)
    .leftJoin(
      promptSuggestions,
      and(eq(promptSuggestions.categoryId, suggestionCategories.id), eq(promptSuggestions.isActive, true)),
    )
    .orderBy(asc(suggestionCategories.sortOrder), asc(promptSuggestions.sortOrder));

  const columns = new Map<string, SuggestionColumn>();
  for (const { category, card } of rows) {
    const column = columns.get(category.id) ?? {
      slug: category.slug,
      title: category.title,
      description: category.description,
      icon: category.icon,
      cards: [],
    };
    if (card) column.cards.push(card);
    columns.set(category.id, column);
  }
  return [...columns.values()];
}
