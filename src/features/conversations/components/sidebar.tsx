"use client";

import { Plus, Search, Settings, X } from "lucide-react";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { ICON_SIZE } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import type { ConversationItem, ViewerDto } from "@/lib/types";
import { ConversationRow } from "./conversation-row";
import { SectionHeader } from "./section-header";

export interface SidebarProps {
  conversations: ConversationItem[];
  activeId: string | null;
  viewer: ViewerDto;
  search: string;
  onSearch: (value: string) => void;
  onNewChat: () => void;
  onOpen: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onOpenSettings: () => void;
}

const SECTIONS = [
  { group: "today", label: "Your conversations" },
  { group: "last7Days", label: "Last 7 Days" },
  { group: "older", label: "Older" },
] as const;

export function Sidebar(props: SidebarProps) {
  const { conversations, viewer, search, onSearch, onNewChat, onClearAll, onOpenSettings } = props;
  const [isSearching, setIsSearching] = useState(search.length > 0);

  return (
    <aside className="flex h-full w-drawer shrink-0 flex-col rounded-panel bg-surface lg:w-sidebar-lg xl:w-sidebar">
      <div className="px-7.5 pt-7.5">
        <p className="logo-type text-26 leading-none text-ink">CHAT A.I+</p>
      </div>

      <div className="mt-11.5 flex items-center gap-2.5 px-7.5">
        <Button onClick={onNewChat} className="flex-1 gap-2.5">
          <Plus size={ICON_SIZE.md} strokeWidth={1.75} aria-hidden />
          New chat
        </Button>
        <Toggle
          aria-label={isSearching ? "Close search" : "Search conversations"}
          pressed={isSearching}
          onPressedChange={(isPressed) => {
            if (!isPressed) onSearch("");
            setIsSearching(isPressed);
          }}
          className={buttonVariants({ variant: "dark", size: "icon-lg" })}
        >
          {isSearching ? (
            <X size={ICON_SIZE.md} aria-hidden />
          ) : (
            <Search size={ICON_SIZE.md} strokeWidth={2} aria-hidden />
          )}
        </Toggle>
      </div>

      {isSearching && (
        <div className="mt-3 px-7.5">
          <Input
            variant="pill"
            autoFocus
            type="search"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search conversations"
            aria-label="Search conversations"
          />
        </div>
      )}

      <nav aria-label="Conversations" className="sidebar-list mt-5 min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
        {conversations.length === 0 && <SectionHeader label="Your conversations" onClearAll={undefined} />}
        {SECTIONS.map(({ group, label }, index) => {
          const items = conversations.filter((c) => c.group === group);
          if (items.length === 0) return null;
          const isFirst = SECTIONS.findIndex((s) => conversations.some((c) => c.group === s.group)) === index;
          return (
            <section key={group}>
              <SectionHeader label={label} onClearAll={isFirst ? onClearAll : undefined} />
              <ul>
                {items.map((c) => (
                  <ConversationRow key={c.id} item={c} {...props} />
                ))}
              </ul>
            </section>
          );
        })}
      </nav>

      <div className="flex flex-col gap-3.25 px-7.25 pt-3 pb-7.25">
        <Button variant="outline" onClick={onOpenSettings} className="h-13 justify-start gap-3 px-2">
          <span className="flex size-9 items-center justify-center rounded-full border border-line">
            <Settings size={ICON_SIZE.sm} strokeWidth={1.75} aria-hidden />
          </span>
          Settings
        </Button>
        <div className="flex h-13 items-center gap-3 rounded-full border border-line px-2 text-15 text-ink-2">
          <Avatar name={viewer.name} image={viewer.image} size={34} />
          <span className="truncate">{viewer.name}</span>
        </div>
      </div>
    </aside>
  );
}
