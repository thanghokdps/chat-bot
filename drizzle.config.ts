import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: [
    "./src/db/schema/auth.ts",
    "./src/db/schema/accounts.ts",
    "./src/db/schema/chat.ts",
    "./src/db/schema/suggestions.ts",
  ],
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL ?? "postgres://chat:chat@localhost:5432/chat" },
});
