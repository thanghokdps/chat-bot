import type { z } from "zod";
import { type VerifiedUser, verifiedUser } from "@/agent/identity";

export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
  ) {
    super(code);
  }
}

export async function requireUser(request: Request): Promise<VerifiedUser> {
  const user = await verifiedUser(request.headers);
  if (!user) throw new HttpError(401, "unauthorized");
  return user;
}

export async function parseJson<T extends z.ZodType>(request: Request, schema: T): Promise<z.infer<T>> {
  const body: unknown = await request.json().catch(() => undefined);
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new HttpError(400, "invalid_body");
  return parsed.data;
}

/** Wraps a route so auth and validation failures become short JSON errors, never stack traces. */
export function route<TArgs extends unknown[]>(
  handler: (request: Request, ...args: TArgs) => Promise<Response>,
): (request: Request, ...args: TArgs) => Promise<Response> {
  return async (request, ...args) => {
    try {
      return await handler(request, ...args);
    } catch (error) {
      if (error instanceof HttpError) return Response.json({ error: error.code }, { status: error.status });
      console.error("route failed", {
        path: new URL(request.url).pathname,
        error: error instanceof Error ? error.message : "unknown",
      });
      return Response.json({ error: "internal" }, { status: 500 });
    }
  };
}

export const notFound = (): never => {
  throw new HttpError(404, "not_found");
};
