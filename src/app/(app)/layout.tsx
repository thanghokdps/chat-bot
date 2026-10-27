import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { verifiedUser } from "@/agent/identity";
import { db } from "@/db/client";
import { AppShell } from "@/features/shell";
import { getPlan } from "@/server/plans/repository";
import { getSettings } from "@/server/settings/repository";
import { listSuggestions } from "@/server/suggestions/repository";

export const dynamic = "force-dynamic";

// The chat UI lives in the layout so moving between "/" and "/c/[id]" keeps one CopilotKit provider and sidebar.
export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await verifiedUser(await headers());
  if (!user) redirect("/sign-up");

  const [settings, plan, suggestions] = await Promise.all([
    getSettings(db(), user.id),
    getPlan(db(), user.id, new Date()),
    listSuggestions(db()),
  ]);

  return (
    <>
      <AppShell
        viewer={{ name: user.name, image: user.image }}
        background={settings.background}
        plan={plan.plan}
        suggestions={suggestions}
      />
      {children}
    </>
  );
}
