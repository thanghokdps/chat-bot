export class ApiError extends Error {
  constructor(readonly status: number) {
    super(`request failed with ${status}`);
  }
}

/** Same-origin JSON call; a 401 sends the browser to sign-in. */
export async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: init?.body ? { "content-type": "application/json" } : undefined,
  });
  if (res.status === 401) {
    window.location.assign(new URL("/sign-in", window.location.origin));
    throw new ApiError(401);
  }
  if (!res.ok) throw new ApiError(res.status);
  // Trust boundary is the server route, which validates and shapes its own JSON; T names that contract.
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}

export const jsonBody = (body: unknown): RequestInit => ({ body: JSON.stringify(body) });
