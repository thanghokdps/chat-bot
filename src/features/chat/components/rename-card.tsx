import { Button } from "@/components/ui/button";

export function RenameCard({
  title,
  isSaving,
  onConfirm,
  onCancel,
}: {
  title: string;
  isSaving: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <section
      aria-label="Rename this chat"
      className="mt-6 flex flex-col gap-3 rounded-card border border-line bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="min-w-0 text-15 wrap-anywhere text-ink-2">
        Rename this chat to <strong>“{title}”</strong>?
      </p>
      <div className="flex shrink-0 gap-2">
        <Button variant="outline" size="sm" disabled={isSaving} onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" disabled={isSaving} onClick={onConfirm}>
          Confirm
        </Button>
      </div>
    </section>
  );
}
