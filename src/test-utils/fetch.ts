import { vi } from "vitest";

/** Stubs fetch with one JSON response and returns the mock to inspect the calls. */
export function stubFetch(status: number, body?: unknown) {
  const mock = vi.fn<typeof fetch>(
    async () => new Response(body === undefined ? null : JSON.stringify(body), { status }),
  );
  vi.stubGlobal("fetch", mock);
  return mock;
}
