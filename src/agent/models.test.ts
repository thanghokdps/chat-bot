import { describe, expect, it } from "vitest";
import { isRetryableModelError } from "./models";

function httpError(status: number): Error {
  return Object.assign(new Error(`HTTP ${status}`), { status });
}

describe("isRetryableModelError", () => {
  it.each([408, 429, 500, 502, 503, 504])("falls back on %i", (status) => {
    expect(isRetryableModelError(httpError(status))).toBe(true);
  });

  it.each([400, 401, 403, 404, 422])("does not fall back on %i", (status) => {
    expect(isRetryableModelError(httpError(status))).toBe(false);
  });

  it("falls back on network resets", () => {
    expect(isRetryableModelError(Object.assign(new Error("reset"), { code: "ECONNRESET" }))).toBe(true);
  });

  it("never falls back after the user aborted", () => {
    const abort = new Error("aborted");
    abort.name = "AbortError";
    expect(isRetryableModelError(abort)).toBe(false);
  });

  it("does not fall back on unknown errors", () => {
    expect(isRetryableModelError(new Error("boom"))).toBe(false);
    expect(isRetryableModelError("boom")).toBe(false);
  });
});
