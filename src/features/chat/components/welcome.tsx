import { Globe, MoveRight, TriangleAlert, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ICON_SIZE } from "@/components/ui/icon";
import type { SuggestionColumnDto } from "@/lib/types";

const ICONS = { globe: Globe, bolt: Zap, warning: TriangleAlert } as const;

// Sizes follow the main column's width (container queries), so the drawer and sidebar both just work.
export function Welcome({ columns, onPick }: { columns: SuggestionColumnDto[]; onPick: (prompt: string) => void }) {
  return (
    <div className="mx-auto flex w-full max-w-238 flex-col items-center pt-welcome-top pb-35 @3xl:pb-40">
      <p className="logo-type hidden h-16 items-center rounded-full bg-surface px-5.5 text-26 leading-none text-ink @xl:flex">
        CHAT A.I+
      </p>
      <h1 className="text-center text-28 leading-heading font-medium text-ink @xl:mt-4 @xl:text-36 @4xl:text-44">
        Good day! How may I assist you today?
      </h1>

      <div className="mt-welcome-gap flex w-full flex-col gap-6 @2xl:gap-5">
        {columns.map((column) => {
          const Icon = ICONS[column.icon];
          return (
            <div key={column.slug} className="flex flex-col gap-3 @2xl:flex-row @2xl:items-stretch @2xl:gap-0">
              <div className="flex items-center gap-3 rounded-card bg-tile px-3.5 py-3 text-white @2xl:min-h-36.25 @2xl:w-35 @2xl:shrink-0 @2xl:flex-col @2xl:items-start @2xl:gap-0 @2xl:px-2.5 @2xl:pt-2.5 @2xl:pb-0">
                <Icon size={ICON_SIZE.xl} strokeWidth={1.5} className="shrink-0" aria-hidden />
                <div className="min-w-0 @2xl:mt-2">
                  <h2 className="text-18 leading-tight font-medium @2xl:text-22">{column.title}</h2>
                  <p className="mt-0.5 text-12 leading-caption text-tile-muted @2xl:mt-1.5">{column.description}</p>
                </div>
              </div>
              <div aria-hidden className="mx-5 hidden items-center gap-1 @2xl:flex">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="h-10 w-1 rounded-full bg-tile-muted" />
                ))}
              </div>
              <div className="grid flex-1 grid-cols-1 gap-3 @sm:grid-cols-2 @2xl:gap-4.5">
                {column.cards.map((card) => (
                  <Button
                    key={card.id}
                    variant="card"
                    size="bare"
                    onClick={() => onPick(card.prompt)}
                    className="min-h-28 min-w-0 gap-0 p-2.5 @2xl:min-h-36.25 @2xl:pb-1.5"
                  >
                    {card.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element -- small static thumbnails cropped from the design
                      <img
                        src={card.imageUrl}
                        alt=""
                        width={54}
                        height={54}
                        className="size-10 rounded-full @2xl:size-13.5"
                      />
                    )}
                    <span className="mt-2 text-18 leading-tight font-medium text-ink-2 @2xl:mt-2.5 @2xl:text-22">
                      {card.title}
                    </span>
                    <span className="mt-1.5 flex items-center justify-between gap-2 text-14 text-ink-2">
                      {card.prompt}
                      <MoveRight size={ICON_SIZE.lg} strokeWidth={1.5} className="shrink-0" aria-hidden />
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
