import { fetchJson, jsonBody } from "@/lib/fetch-json";
import type { Background } from "@/lib/types";

export const settingsApi = {
  update: (patch: { background?: Background }) =>
    fetchJson<{ background: Background }>("/api/settings", { method: "PATCH", ...jsonBody(patch) }),
};
