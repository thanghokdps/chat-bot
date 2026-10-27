import { describe, expect, it, vi } from "vitest";
import { signInAs } from "@/test-utils/route";

const redirect = vi.fn((to: string) => {
  throw new Error(`redirect:${to}`);
});
vi.mock("next/navigation", () => ({ redirect }));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("@/agent/identity", async () => (await import("@/test-utils/route")).identityMock());
vi.mock("@/server/auth/providers", () => ({ enabledProviders: () => ({ google: true, apple: false }) }));
vi.mock("@/features/auth", () => ({ AuthScreen: () => null }));
const { default: Page } = await import("./page");

describe("/sign-in", () => {
  it("sends a signed-in user to the chat", async () => {
    signInAs("alice");
    await expect(Page()).rejects.toThrow("redirect:/");
  });

  it("renders the sign-in screen with the configured providers", async () => {
    signInAs(null);
    const tree = await Page();
    expect(tree.props).toEqual({ mode: "sign-in", providers: { google: true, apple: false } });
  });
});
