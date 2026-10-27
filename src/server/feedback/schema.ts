import { z } from "zod";

export const ratingSchema = z.object({ rating: z.union([z.literal(1), z.literal(-1), z.null()]) });
export const messageIdSchema = z.uuid();
