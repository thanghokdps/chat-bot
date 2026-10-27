import { db } from "../src/db/client";
import { seed } from "../src/db/seed";

await seed(db());
console.info("seeded plan_limits and suggestions");
process.exit(0);
