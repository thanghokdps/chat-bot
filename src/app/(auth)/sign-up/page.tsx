import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { verifiedUser } from "@/agent/identity";
import { AuthScreen } from "@/features/auth";
import { enabledProviders } from "@/server/auth/providers";

export const dynamic = "force-dynamic";

export default async function Page() {
  if (await verifiedUser(await headers())) redirect("/");
  return <AuthScreen mode="sign-up" providers={enabledProviders()} />;
}
