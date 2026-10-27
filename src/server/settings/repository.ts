import { eq } from "drizzle-orm";
import type { Db } from "@/db/client";
import { type Background, userSettings } from "@/db/schema";

export interface Settings {
  theme: "light" | "dark" | "system";
  background: Background;
  language: string;
}

const DEFAULT_SETTINGS: Settings = { theme: "light", background: "gray", language: "en" };

export async function getSettings(db: Db, userId: string): Promise<Settings> {
  const [row] = await db
    .select({ theme: userSettings.theme, background: userSettings.background, language: userSettings.language })
    .from(userSettings)
    .where(eq(userSettings.userId, userId));
  return row ?? DEFAULT_SETTINGS;
}

export async function updateSettings(db: Db, userId: string, patch: Partial<Settings>): Promise<Settings> {
  const [row] = await db
    .insert(userSettings)
    .values({ ...DEFAULT_SETTINGS, ...patch, userId })
    .onConflictDoUpdate({ target: userSettings.userId, set: patch })
    .returning({ theme: userSettings.theme, background: userSettings.background, language: userSettings.language });
  if (!row) throw new Error("settings upsert returned no row");
  return row;
}
