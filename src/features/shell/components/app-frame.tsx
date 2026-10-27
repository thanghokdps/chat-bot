"use client";

import { Menu } from "lucide-react";
import { type ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { ICON_SIZE } from "@/components/ui/icon";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { UpgradePill, UpgradeTab } from "@/features/billing";
import { Sidebar, type SidebarProps } from "@/features/conversations";
import type { Background } from "@/lib/types";

/** Page chrome shared by the live app and the fixture states page: sidebar, main column, Upgrade tab. */
export function AppFrame({
  background,
  sidebar,
  plan,
  onUpgrade,
  children,
}: {
  background: Background;
  sidebar: SidebarProps;
  plan: string;
  onUpgrade: () => void;
  children: ReactNode;
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerSidebar: SidebarProps = {
    ...sidebar,
    onNewChat: () => {
      setIsDrawerOpen(false);
      sidebar.onNewChat();
    },
    onOpen: (id) => {
      setIsDrawerOpen(false);
      sidebar.onOpen(id);
    },
  };

  return (
    <div data-background={background} className="flex h-dvh bg-page lg:p-5">
      <div className="hidden lg:block">
        <Sidebar {...sidebar} />
      </div>
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        {/* The portal sits outside [data-background], so it carries the page colour itself for the row notch. */}
        <SheetContent data-background={background} className="lg:hidden">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <Sidebar {...drawerSidebar} />
        </SheetContent>
      </Sheet>
      <main className="flex min-w-0 flex-1 flex-col lg:-my-5 lg:-mr-5">
        <header className="flex h-16 shrink-0 items-center justify-between gap-3 px-4 sm:px-6 lg:hidden">
          <Button
            variant="surface"
            size="icon-md"
            aria-label="Open menu"
            aria-expanded={isDrawerOpen}
            onClick={() => setIsDrawerOpen(true)}
            className="shadow-sm"
          >
            <Menu size={ICON_SIZE.lg} aria-hidden />
          </Button>
          <p className="logo-type truncate text-18 leading-none text-ink">CHAT A.I+</p>
          <UpgradePill plan={plan} onUpgrade={onUpgrade} />
        </header>
        <div className="@container relative min-h-0 flex-1">{children}</div>
      </main>
      <UpgradeTab plan={plan} onUpgrade={onUpgrade} />
    </div>
  );
}
