import { Button } from "@/components/ui/button";

/** Side tab from the design, desktop only; centred so it never covers the composer on short screens. */
export function UpgradeTab({ plan, onUpgrade }: { plan: string; onUpgrade: () => void }) {
  if (plan === "pro") return null;
  return (
    <Button
      size="bare"
      onClick={onUpgrade}
      className="fixed top-1/2 right-0 hidden h-upgrade-tab w-12.5 -translate-y-1/2 flex-col gap-3.5 rounded-[var(--radius-tab)_0_0_var(--radius-tab)] lg:flex"
    >
      <span className="rotate-180 text-14 font-medium whitespace-nowrap [writing-mode:vertical-rl]">
        Upgrade to Pro
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element -- the design's ✨ glyph */}
      <img src="/brand/sparkles.png" alt="" width={26} height={26} />
    </Button>
  );
}
