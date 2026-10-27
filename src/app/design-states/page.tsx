import { notFound } from "next/navigation";
import { DesignStates } from "@/dev/design-states";

export const metadata = { robots: { index: false } };

// Dev-only: every chat state rendered from fixtures, for screenshots against design/frames (ui-map Step 4).
export default async function Page({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const { state } = await searchParams;
  return <DesignStates state={state ?? "welcome"} />;
}
