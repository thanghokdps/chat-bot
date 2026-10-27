import { fetchJson, jsonBody } from "@/lib/fetch-json";
import type { ThreadDto } from "@/lib/types";

export const chatApi = {
  getThread: (id: string) => fetchJson<ThreadDto>(`/api/conversations/${id}`),
  rate: (messageId: string, rating: 1 | -1 | null) =>
    fetchJson<{ rating: number | null }>(`/api/messages/${messageId}/feedback`, {
      method: "PUT",
      ...jsonBody({ rating }),
    }),
};
