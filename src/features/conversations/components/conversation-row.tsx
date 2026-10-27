"use client";

import { Check, MessageSquareMore, Pencil, Trash2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { ICON_SIZE } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import type { ConversationItem } from "@/lib/types";
import type { SidebarProps } from "./sidebar";

export function ConversationRow({
  item,
  activeId,
  onOpen,
  onRename,
  onDelete,
}: { item: ConversationItem } & SidebarProps) {
  const isActive = item.id === activeId;
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(item.title);

  function submit(e: FormEvent) {
    e.preventDefault();
    const title = draft.trim();
    if (title && title !== item.title) onRename(item.id, title);
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <li className="px-4.5 py-1.25">
        <form onSubmit={submit} className="flex h-12 items-center gap-2 rounded-full bg-primary-50 px-3.5">
          <Input
            variant="bare"
            autoFocus
            value={draft}
            maxLength={80}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setIsEditing(false)}
            aria-label="Conversation title"
            className="flex-1 text-primary lg:text-15"
          />
          <Button type="submit" variant="ghost" size="bare" aria-label="Save title" className="text-primary">
            <Check size={ICON_SIZE.sm} aria-hidden />
          </Button>
        </form>
      </li>
    );
  }

  return (
    <li className="relative px-4.5 py-1.25">
      <div
        className={cn(
          "group flex h-12 items-center rounded-full pr-1.5 pl-3",
          isActive ? "bg-primary-50" : "hover:bg-primary-50/60",
        )}
      >
        <Button
          variant="ghost"
          size="bare"
          onClick={() => onOpen(item.id)}
          aria-current={isActive ? "page" : undefined}
          className={cn(
            "min-w-0 flex-1 justify-start gap-2.5 text-left text-16",
            isActive ? "text-primary" : "text-ink",
          )}
        >
          <MessageSquareMore size={ICON_SIZE.md} strokeWidth={2} className="shrink-0" aria-hidden />
          <span className="truncate">{item.title}</span>
        </Button>
        <div
          className={cn(
            "ml-2 h-9.5 items-center gap-2.5 rounded-full bg-primary-100 px-3 text-ink",
            isActive ? "flex" : "hidden group-focus-within:flex group-hover:flex",
          )}
        >
          <Button variant="ghost" size="bare" aria-label={`Delete ${item.title}`} onClick={() => onDelete(item.id)}>
            <Trash2 size={ICON_SIZE.sm} strokeWidth={1.6} aria-hidden />
          </Button>
          <Button
            variant="ghost"
            size="bare"
            aria-label={`Rename ${item.title}`}
            onClick={() => {
              setDraft(item.title);
              setIsEditing(true);
            }}
          >
            <Pencil size={ICON_SIZE.sm} strokeWidth={1.6} aria-hidden />
          </Button>
        </div>
      </div>
      {isActive && (
        <>
          {/* Notch cut into the card edge (clipped by the list) with the active dot beside it, as drawn. */}
          <span aria-hidden className="absolute top-1/2 -right-4.25 size-8.5 -translate-y-1/2 rounded-full bg-page" />
          <span aria-hidden className="absolute top-1/2 right-1 size-3 -translate-y-1/2 rounded-full bg-primary" />
        </>
      )}
    </li>
  );
}
