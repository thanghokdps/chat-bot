import { describe, expect, it, vi } from "vitest";

const config: Record<string, string | undefined> = {};
vi.mock("@/agent/env", () => ({ env: () => config }));
const { enabledProviders } = await import("./providers");

describe("enabledProviders", () => {
  it("shows a provider only when it is configured", () => {
    expect(enabledProviders()).toEqual({ google: false, apple: false });
    config.GOOGLE_CLIENT_ID = "id";
    expect(enabledProviders()).toEqual({ google: true, apple: false });
  });
});
