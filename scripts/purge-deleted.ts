import { db } from "../src/db/client";
import { purgeDeletedConversations } from "../src/server/conversations/repository";

// Retention job (ADR 0001 decision 10): run daily from cron.
const RETENTION_DAYS = 30;
const purged = await purgeDeletedConversations(db(), new Date(Date.now() - RETENTION_DAYS * 86_400_000));
console.info(`purged ${purged} conversations deleted more than ${RETENTION_DAYS} days ago`);
process.exit(0);
