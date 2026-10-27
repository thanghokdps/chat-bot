import { afterEach, describe, expect, it, vi } from "vitest";
import { stubFetch } from "@/test-utils/fetch";
import { chatApi } from "./api";

afterEach(() => vi.unstubAllGlobals());

describe("chatApi", () => {
  it("loads a thread and sends a vote", async () => {
    const fetch = stubFetch(200, { rating: 1 });
    await chatApi.getThread("c1");
    await chatApi.rate("m1", 1);
    expect(fetch.mock.calls[0]?.[0]).toBe("/api/conversations/c1");
    expect(fetch.mock.calls[1]).toEqual([
      "/api/messages/m1/feedback",
      { method: "PUT", body: '{"rating":1}', headers: { "content-type": "application/json" } },
    ]);
  });
});
