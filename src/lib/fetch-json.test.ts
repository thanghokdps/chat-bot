import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, fetchJson, jsonBody } from "./fetch-json";

const assign = vi.fn();

function respond(status: number, body?: unknown) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(body === undefined ? null : JSON.stringify(body), { status })),
  );
  vi.stubGlobal("window", { location: { origin: "http://localhost", assign } });
}

afterEach(() => {
  vi.unstubAllGlobals();
  assign.mockReset();
});

describe("fetchJson", () => {
  it("returns parsed JSON, and undefined for 204", async () => {
    respond(200, { id: "x" });
    expect(await fetchJson("/api/x")).toEqual({ id: "x" });
    respond(204);
    expect(await fetchJson("/api/x", { method: "DELETE" })).toBeUndefined();
  });

  it("sends JSON bodies with a content type", async () => {
    respond(200, {});
    await fetchJson("/api/x", { method: "PATCH", ...jsonBody({ a: 1 }) });
    expect(vi.mocked(fetch).mock.calls[0]?.[1]).toMatchObject({
      body: '{"a":1}',
      headers: { "content-type": "application/json" },
    });
  });

  it("throws ApiError on failure and sends a 401 to sign-in", async () => {
    respond(404);
    await expect(fetchJson("/api/x")).rejects.toBeInstanceOf(ApiError);
    respond(401);
    await expect(fetchJson("/api/x")).rejects.toMatchObject({ status: 401 });
    expect(assign).toHaveBeenCalledWith(new URL("/sign-in", "http://localhost"));
  });
});
