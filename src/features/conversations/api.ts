import { fetchJson, jsonBody } from "@/lib/fetch-json";
import type { ConversationItem } from "@/lib/types";

export const conversationsApi = {
  list: (q: string) =>
    fetchJson<{ conversations: ConversationItem[] }>(
      `/api/conversations${q ? `?q=${encodeURIComponent(q)}` : ""}`,
    ).then((r) => r.conversations),
  create: () => fetchJson<{ id: string }>("/api/conversations", { method: "POST" }).then((r) => r.id),
  clear: () => fetchJson<{ cleared: number }>("/api/conversations", { method: "DELETE" }),
  rename: (id: string, title: string) =>
    fetchJson<{ title: string }>(`/api/conversations/${id}`, { method: "PATCH", ...jsonBody({ title }) }),
  remove: (id: string) => fetchJson<void>(`/api/conversations/${id}`, { method: "DELETE" }),
};
