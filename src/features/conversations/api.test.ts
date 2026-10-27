import { afterEach, describe, expect, it, vi } from "vitest";
import { stubFetch } from "@/test-utils/fetch";
import { conversationsApi } from "./api";

afterEach(() => vi.unstubAllGlobals());

describe("conversationsApi", () => {
  it("lists with an encoded search and unwraps the rows", async () => {
    const fetch = stubFetch(200, { conversations: [{ id: "c1" }] });
    expect(await conversationsApi.list("a&b")).toEqual([{ id: "c1" }]);
    expect(fetch.mock.calls[0]?.[0]).toBe("/api/conversations?q=a%26b");
  });

  it("creates, renames and removes with the right methods", async () => {
    const fetch = stubFetch(200, { id: "c1", title: "T" });
    expect(await conversationsApi.create()).toBe("c1");
    await conversationsApi.rename("c1", "T");
    await conversationsApi.remove("c1");
    await conversationsApi.clear();
    expect(fetch.mock.calls.map(([url, init]) => [url, init?.method])).toEqual([
      ["/api/conversations", "POST"],
      ["/api/conversations/c1", "PATCH"],
      ["/api/conversations/c1", "DELETE"],
      ["/api/conversations", "DELETE"],
    ]);
  });
});
