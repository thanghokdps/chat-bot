import { Button } from "@/components/ui/button";

/** The same action in the mobile top bar, where a side tab would cover the text. */
export function UpgradePill({ plan, onUpgrade }: { plan: string; onUpgrade: () => void }) {
  if (plan === "pro") return <span className="size-11" aria-hidden />;
  return (
    <Button
      onClick={onUpgrade}
      aria-label="Upgrade to Pro"
      className="h-10 shrink-0 gap-1.5 px-3.5 text-13 font-medium"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- the design's ✨ glyph */}
      <img src="/brand/sparkles.png" alt="" width={18} height={18} />
      Pro
    </Button>
  );
}
