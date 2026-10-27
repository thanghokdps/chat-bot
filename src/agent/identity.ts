import { auth } from "@/server/auth/auth";

export interface VerifiedUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

/** The only source of "who is calling": a Better Auth session verified server-side from the cookie. */
export async function verifiedUser(headers: Headers): Promise<VerifiedUser | null> {
  const session = await auth().api.getSession({ headers });
  if (!session) return null;
  const { id, name, email, image } = session.user;
  return { id, name, email, image: image ?? null };
}
