import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Db } from "@/db/client";
import { createUser, testDb } from "@/test-utils/pglite";
import { signInAs } from "@/test-utils/route";

let db: Db;
const redirect = vi.fn((to: string) => {
  throw new Error(`redirect:${to}`);
});
vi.mock("next/navigation", () => ({ redirect }));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("@/agent/identity", async () => (await import("@/test-utils/route")).identityMock());
vi.mock("@/db/client", () => ({ db: () => db }));
vi.mock("@/features/shell", () => ({ AppShell: () => null }));
const { default: AppLayout } = await import("./layout");

beforeEach(async () => {
  db = await testDb();
  await createUser(db, "alice");
});

describe("(app) layout", () => {
  it("sends a signed-out visitor to sign-up before loading any data", async () => {
    signInAs(null);
    await expect(AppLayout({ children: null })).rejects.toThrow("redirect:/sign-up");
  });

  it("gives the shell the caller's settings, plan and the suggestion grid", async () => {
    signInAs("alice");
    const tree = await AppLayout({ children: null });
    const shell = tree.props.children[0];
    expect(shell.props).toMatchObject({ viewer: { name: "alice", image: null }, background: "gray", plan: "free" });
    expect(shell.props.suggestions).toHaveLength(3);
  });
});
