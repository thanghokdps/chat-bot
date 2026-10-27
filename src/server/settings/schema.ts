import { z } from "zod";
import { BACKGROUNDS } from "@/db/schema";

export const settingsPatchSchema = z
  .object({
    theme: z.enum(["light", "dark", "system"]),
    background: z.enum(BACKGROUNDS),
    language: z.string().min(2).max(10),
  })
  .partial()
  .strict();
