import { db } from "@/db/client";
import { requireUser, route } from "@/server/http";
import { usageToday } from "@/server/plans/service";

export const GET = route(async (request) => {
  const user = await requireUser(request);
  const usage = await usageToday(db(), user.id, new Date());
  return Response.json({ user, plan: usage.plan, dailyMessages: usage.dailyMessages, usedToday: usage.usedToday });
});
