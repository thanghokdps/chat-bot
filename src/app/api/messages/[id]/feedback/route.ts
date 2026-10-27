import { db } from "@/db/client";
import { setFeedback } from "@/server/feedback/repository";
import { messageIdSchema, ratingSchema } from "@/server/feedback/schema";
import { notFound, parseJson, requireUser, route } from "@/server/http";

export const PUT = route(async (request, { params }: { params: Promise<{ id: string }> }) => {
  const user = await requireUser(request);
  const { id } = await params;
  if (!messageIdSchema.safeParse(id).success) notFound();
  const { rating } = await parseJson(request, ratingSchema);
  if (!(await setFeedback(db(), { userId: user.id, messageId: id, rating }))) notFound();
  return Response.json({ rating });
});
