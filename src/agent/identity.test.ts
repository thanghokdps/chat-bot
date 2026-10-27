import { describe, expect, it, vi } from "vitest";

const getSession = vi.fn();
vi.mock("@/server/auth/auth", () => ({ auth: () => ({ api: { getSession } }) }));
const { verifiedUser } = await import("./identity");

describe("verifiedUser", () => {
  it("returns only the session user's public fields", async () => {
    getSession.mockResolvedValueOnce({
      user: { id: "u1", name: "Ann", email: "ann@example.com", image: undefined, emailVerified: true },
      session: { token: "secret" },
    });
    expect(await verifiedUser(new Headers({ cookie: "x" }))).toEqual({
      id: "u1",
      name: "Ann",
      email: "ann@example.com",
      image: null,
    });
  });

  it("is null without a valid session", async () => {
    getSession.mockResolvedValueOnce(null);
    expect(await verifiedUser(new Headers())).toBeNull();
  });
});
