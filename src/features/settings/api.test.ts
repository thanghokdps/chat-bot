import { afterEach, describe, expect, it, vi } from "vitest";
import { stubFetch } from "@/test-utils/fetch";
import { settingsApi } from "./api";

afterEach(() => vi.unstubAllGlobals());

describe("settingsApi", () => {
  it("patches the background", async () => {
    const fetch = stubFetch(200, { background: "pink" });
    expect(await settingsApi.update({ background: "pink" })).toEqual({ background: "pink" });
    expect(fetch.mock.calls[0]?.[1]).toMatchObject({ method: "PATCH", body: '{"background":"pink"}' });
  });
});
