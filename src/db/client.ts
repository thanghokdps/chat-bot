import { drizzle } from "drizzle-orm/node-postgres";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { Pool } from "pg";
import { env } from "@/agent/env";
import { tables } from "./schema";

// Driver-agnostic so tests can pass a PGlite database to the same repository code.
export type Db = PgDatabase<PgQueryResultHKT, typeof tables>;

const globalForDb = globalThis as unknown as { db?: Db };

// One pool per process; Next dev hot-reload would otherwise open a new pool per edit.
export function db(): Db {
  globalForDb.db ??= drizzle(new Pool({ connectionString: env().DATABASE_URL, max: 10 }), { schema: tables });
  return globalForDb.db;
}
