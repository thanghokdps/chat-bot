import { db } from "@/db/client";
import { parseJson, requireUser, route } from "@/server/http";
import { getSettings, updateSettings } from "@/server/settings/repository";
import { settingsPatchSchema } from "@/server/settings/schema";

export const GET = route(async (request) => {
  const user = await requireUser(request);
  return Response.json(await getSettings(db(), user.id));
});

export const PATCH = route(async (request) => {
  const user = await requireUser(request);
  return Response.json(await updateSettings(db(), user.id, await parseJson(request, settingsPatchSchema)));
});
