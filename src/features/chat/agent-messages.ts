import type { Message } from "@ag-ui/core";
import type { Notice, ThreadMessageDto } from "@/lib/types";

export function conversationIdFromPath(pathname: string): string | null {
  const match = /^\/c\/([0-9a-f-]{36})$/i.exec(pathname);
  return match?.[1] ?? null;
}

export function isNotice(value: unknown): value is Notice {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof Reflect.get(value, "code") === "string" &&
    typeof Reflect.get(value, "message") === "string"
  );
}

export function toAgentMessage({ id, role, content }: ThreadMessageDto): Message {
  return { id, role, content };
}

/** While a turn streams, the agent's messages are shown; ids the database knows keep their status and vote. */
export function fromAgent(messages: Message[], known: ThreadMessageDto[]): ThreadMessageDto[] {
  const byId = new Map(known.map((m) => [m.id, m]));
  return messages.flatMap((m): ThreadMessageDto[] => {
    if (m.role !== "user" && m.role !== "assistant") return [];
    const stored = byId.get(m.id);
    const content = typeof m.content === "string" ? m.content : "";
    return [
      {
        id: m.id,
        parentMessageId: null,
        role: m.role,
        content,
        status: stored?.status ?? (m.role === "user" ? "complete" : "streaming"),
        rating: stored?.rating ?? null,
      },
    ];
  });
}
