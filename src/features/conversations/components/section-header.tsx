import { Button } from "@/components/ui/button";

export function SectionHeader({ label, onClearAll }: { label: string; onClearAll: (() => void) | undefined }) {
  return (
    <div className="flex h-15 items-center justify-between border-y-3 border-divider px-7.5 text-13">
      <span className="text-muted">{label}</span>
      {onClearAll && (
        <Button variant="link" size="bare" onClick={onClearAll}>
          Clear All
        </Button>
      )}
    </div>
  );
}
