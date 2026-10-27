import { tool } from "langchain";
import { z } from "zod";
import { renameSchema } from "@/server/conversations/schema";

export const PROPOSE_RENAME = "propose_rename";

export type RenameProposal = { ok: true; title: string } | { ok: false };

export function proposeRename(title: string): RenameProposal {
  const parsed = renameSchema.safeParse({ title });
  return parsed.success ? { ok: true, title: parsed.data.title } : { ok: false };
}

/** Re-validates the tool's output instead of trusting a cast; anything unreadable counts as invalid. */
export function readProposal(toolOutput: string): RenameProposal {
  try {
    const value: unknown = JSON.parse(toolOutput);
    const title = typeof value === "object" && value !== null ? Reflect.get(value, "title") : undefined;
    return typeof title === "string" ? proposeRename(title) : { ok: false };
  } catch {
    return { ok: false };
  }
}

/** Fixed copy: the model never words this, so the reply cannot claim the chat is already renamed. */
export function renameReply(proposal: RenameProposal): string {
  return proposal.ok
    ? `Rename this chat to “${proposal.title}”?`
    : "Chat titles must be 1–80 characters. Try a different title.";
}

/**
 * Validates only; it never writes. The user's Confirm on the card calls PATCH /api/conversations/:id,
 * which owns the session and ownership checks (ticket 1, ADR 0001 decision 21).
 */
export const proposeRenameTool = tool(async ({ title }) => JSON.stringify(proposeRename(title)), {
  name: PROPOSE_RENAME,
  description: [
    "Propose a new title for the current chat; the user confirms it on a card before anything changes.",
    "- Use only when the user asks to rename, retitle or name this chat.",
    "- Pass the title exactly as the user wrote it, without shortening it.",
    "- If they gave no title, pass a short title (at most 5 words) that sums up this conversation.",
    "- It cannot rename any other chat.",
  ].join("\n"),
  schema: z.object({ title: z.string().describe("The new chat title") }),
  returnDirect: true,
});
