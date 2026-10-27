import { z } from "zod";

export const conversationIdSchema = z.uuid();
export const renameSchema = z.object({ title: z.string().trim().min(1).max(80) });
