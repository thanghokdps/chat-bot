"use client";

import { PenLine } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ICON_SIZE } from "@/components/ui/icon";
import { Textarea } from "@/components/ui/textarea";
import type { ThreadMessageDto, ViewerDto } from "@/lib/types";
import type { ThreadProps } from "./thread";

export function PromptLine({
  prompt,
  viewer,
  isLocked,
  onEdit,
}: {
  prompt: ThreadMessageDto;
  viewer: ViewerDto;
  isLocked: boolean;
  onEdit: ThreadProps["onEdit"];
}) {
  const [draft, setDraft] = useState<string | null>(null);

  function submit(e: FormEvent) {
    e.preventDefault();
    const content = draft?.trim();
    if (content && content !== prompt.content) onEdit(prompt.id, content);
    setDraft(null);
  }

  return (
    <div className="flex items-start gap-2">
      <Avatar name={viewer.name} image={viewer.image} size={28} />
      {draft === null ? (
        <>
          <p className="min-w-0 flex-1 pt-0.75 text-16 leading-5.5 tracking-prompt whitespace-pre-wrap text-body">
            {prompt.content}
          </p>
          <Button
            variant="soft"
            size="icon"
            disabled={isLocked}
            onClick={() => setDraft(prompt.content)}
            aria-label="Edit prompt"
            className="-mt-1.5 shrink-0 disabled:opacity-40"
          >
            <PenLine size={ICON_SIZE.md} strokeWidth={1.6} aria-hidden />
          </Button>
        </>
      ) : (
        <form onSubmit={submit} className="flex min-w-0 flex-1 flex-col gap-2">
          <Textarea
            autoFocus
            value={draft}
            maxLength={8000}
            onChange={(e) => setDraft(e.target.value)}
            aria-label="Edit prompt"
            className="text-body @3xl:text-15"
          />
          <div className="flex gap-2">
            <Button type="submit" size="sm" className="px-4">
              Save &amp; send
            </Button>
            <Button variant="surface" size="sm" onClick={() => setDraft(null)} className="px-4">
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
