import { db } from "@/db/client";
import { deleteConversation, getThread, renameConversation } from "@/server/conversations/repository";
import { conversationIdSchema, renameSchema } from "@/server/conversations/schema";
import { notFound, parseJson, requireUser, route } from "@/server/http";

interface Params {
  params: Promise<{ id: string }>;
}

async function conversationId({ params }: Params): Promise<string> {
  const { id } = await params;
  return conversationIdSchema.safeParse(id).success ? id : notFound();
}

export const GET = route(async (request, ctx: Params) => {
  const user = await requireUser(request);
  return Response.json((await getThread(db(), user.id, await conversationId(ctx))) ?? notFound());
});

export const PATCH = route(async (request, ctx: Params) => {
  const user = await requireUser(request);
  const { title } = await parseJson(request, renameSchema);
  if (!(await renameConversation(db(), user.id, await conversationId(ctx), title))) notFound();
  return Response.json({ title });
});

export const DELETE = route(async (request, ctx: Params) => {
  const user = await requireUser(request);
  if (!(await deleteConversation(db(), user.id, await conversationId(ctx)))) notFound();
  return new Response(null, { status: 204 });
});
