"use client";

import { Dialog as SheetPrimitive } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export const Sheet = SheetPrimitive.Root;
export const SheetTitle = SheetPrimitive.Title;

/** Drawer sliding in from the left edge, for the sidebar below lg. Its child brings its own surface. */
export function SheetContent({ className, ...props }: ComponentProps<typeof SheetPrimitive.Content>) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Overlay className="fixed inset-0 z-20 bg-black/20 data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in" />
      <SheetPrimitive.Content
        aria-describedby={undefined}
        className={cn(
          "fixed inset-y-3 left-3 z-30 outline-none data-[state=closed]:animate-sheet-out data-[state=open]:animate-sheet-in",
          className,
        )}
        {...props}
      />
    </SheetPrimitive.Portal>
  );
}
