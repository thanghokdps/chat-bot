import { vi } from "vitest";
import type { VerifiedUser } from "@/agent/identity";

/** Who the mocked session belongs to; null means signed out. */
export const session: { user: VerifiedUser | null } = { user: null };

export function signInAs(id: string | null): void {
  session.user = id ? { id, name: id, email: `${id}@example.com`, image: null } : null;
}

export function request(path: string, init: { method?: string; body?: unknown } = {}): Request {
  return new Request(`http://localhost${path}`, {
    method: init.method ?? "GET",
    body: init.body === undefined ? undefined : typeof init.body === "string" ? init.body : JSON.stringify(init.body),
    headers: init.body === undefined ? undefined : { "content-type": "application/json" },
  });
}

export const params = <T extends Record<string, string>>(value: T): { params: Promise<T> } => ({
  params: Promise.resolve(value),
});

/** vi.mock factory for "@/agent/identity": the session above instead of Better Auth. */
export const identityMock = () => ({ verifiedUser: vi.fn(async () => session.user) });
