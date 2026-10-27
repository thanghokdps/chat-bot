import { db } from "@/db/client";
import { clearConversations, createConversation } from "@/server/conversations/repository";
import { listSidebar } from "@/server/conversations/service";
import { requireUser, route } from "@/server/http";

export const GET = route(async (request) => {
  const user = await requireUser(request);
  const search = new URL(request.url).searchParams.get("q")?.slice(0, 200) || undefined;
  return Response.json({ conversations: await listSidebar(db(), { userId: user.id, search, now: new Date() }) });
});

export const POST = route(async (request) => {
  const user = await requireUser(request);
  return Response.json({ id: await createConversation(db(), user.id) }, { status: 201 });
});

export const DELETE = route(async (request) => {
  const user = await requireUser(request);
  return Response.json({ cleared: await clearConversations(db(), user.id) });
});
