"use client";

import { SendHorizontal } from "lucide-react";
import { type FormEvent, type KeyboardEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { ICON_SIZE } from "@/components/ui/icon";
import { Textarea } from "@/components/ui/textarea";
import type { Notice } from "@/lib/types";

const MAX_PROMPT_CHARS = 8000;

export function Composer({
  isDisabled,
  notice,
  onSend,
}: {
  isDisabled: boolean;
  notice: Notice | null;
  onSend: (prompt: string) => void;
}) {
  const [value, setValue] = useState("");
  const canSend = !isDisabled && value.trim().length > 0;

  function submit(e?: FormEvent) {
    e?.preventDefault();
    if (!canSend) return;
    onSend(value.trim());
    setValue("");
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-composer-bottom flex flex-col items-center gap-3 px-4 sm:px-6 lg:px-gutter-tab @3xl:bottom-15">
      {notice && (
        <p
          role="status"
          className="pointer-events-auto max-w-full rounded-notice bg-ink-2 px-4 py-2 text-center text-13 text-white shadow-lg"
        >
          {notice.message}
        </p>
      )}
      <form
        onSubmit={submit}
        className="pointer-events-auto flex h-14 w-full max-w-186.75 items-center gap-2 rounded-full bg-surface pr-1.25 pl-4 shadow-composer @3xl:h-15 @3xl:pr-1.5 @3xl:pl-5"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- the design's 🧠 glyph, cropped so it renders the same on every OS */}
        <img src="/brand/brain.png" alt="" width={26} height={26} />
        <Textarea
          variant="bare"
          rows={1}
          value={value}
          maxLength={MAX_PROMPT_CHARS}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="What’s in your mind?..."
          aria-label="Message CHAT A.I+"
          className="h-5.5 flex-1 leading-5.5 text-ink-2 @3xl:text-14"
        />
        <Button
          type="submit"
          size="bare"
          disabled={isDisabled}
          aria-label="Send message"
          className="size-11.5 shrink-0 shadow-send hover:brightness-100 @3xl:size-12"
        >
          <SendHorizontal size={ICON_SIZE.lg} strokeWidth={1.75} className="-rotate-45" aria-hidden />
        </Button>
      </form>
    </div>
  );
}
