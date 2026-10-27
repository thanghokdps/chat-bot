"use client";

import { X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { Button } from "./button";
import { ICON_SIZE } from "./icon";

export const Dialog = DialogPrimitive.Root;
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;

/** Centred modal card: focus trap, Esc and outside click close it (Radix). */
export function DialogContent({
  className,
  children,
  closeLabel = "Close",
  ...props
}: ComponentProps<typeof DialogPrimitive.Content> & { closeLabel?: string }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/25 data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in" />
      <DialogPrimitive.Content
        className={cn(
          "fixed inset-x-4 top-1/2 z-40 mx-auto max-w-95 -translate-y-1/2 rounded-panel bg-surface p-6 shadow-xl outline-none sm:p-7",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={closeLabel}
            className="absolute top-5 right-4 sm:top-6 sm:right-5"
          >
            <X size={ICON_SIZE.lg} aria-hidden />
          </Button>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
