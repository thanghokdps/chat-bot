"use client";

import { Copy, EllipsisVertical, RefreshCcw, ThumbsDown, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ICON_SIZE } from "@/components/ui/icon";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";
import type { ThreadMessageDto } from "@/lib/types";
import type { ThreadProps } from "./thread";

export function AnswerToolbar({
  answer,
  isRunning,
  onRegenerate,
  onRate,
}: {
  answer: ThreadMessageDto;
  isRunning: boolean;
  onRegenerate: ThreadProps["onRegenerate"];
  onRate: ThreadProps["onRate"];
}) {
  const [isCopied, setIsCopied] = useState(false);
  const rate = (r: 1 | -1) => onRate(answer.id, answer.rating === r ? null : r);

  return (
    <div className="mt-5.25 flex flex-wrap items-center justify-between gap-y-2">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8.5 items-center gap-3 rounded-full bg-surface px-3 text-icon">
          <Toggle aria-label="Good answer" pressed={answer.rating === 1} onPressedChange={() => rate(1)}>
            <ThumbsUp size={ICON_SIZE.md} strokeWidth={1.6} aria-hidden />
          </Toggle>
          <Separator orientation="vertical" className="bg-toolbar-rule data-[orientation=vertical]:h-3.5" />
          <Toggle aria-label="Bad answer" pressed={answer.rating === -1} onPressedChange={() => rate(-1)}>
            <ThumbsDown size={ICON_SIZE.md} strokeWidth={1.6} aria-hidden />
          </Toggle>
          <Separator orientation="vertical" className="bg-toolbar-rule data-[orientation=vertical]:h-3.5" />
          <Button
            variant="ghost"
            size="bare"
            aria-label={isCopied ? "Copied" : "Copy answer"}
            onClick={async () => {
              await navigator.clipboard.writeText(answer.content);
              setIsCopied(true);
              setTimeout(() => setIsCopied(false), 1500);
            }}
          >
            <Copy size={ICON_SIZE.md} strokeWidth={1.6} aria-hidden />
          </Button>
        </div>
        <span className="flex size-8.5 items-center justify-center rounded-full bg-surface text-icon" aria-hidden>
          <EllipsisVertical size={ICON_SIZE.sm} />
        </span>
      </div>
      <Button
        variant="surface"
        size="sm"
        disabled={isRunning}
        onClick={() => onRegenerate(answer.id)}
        className="disabled:opacity-40"
      >
        <RefreshCcw size={ICON_SIZE.sm} strokeWidth={1.6} aria-hidden />
        Regenerate
      </Button>
    </div>
  );
}
