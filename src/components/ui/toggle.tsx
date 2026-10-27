"use client";

import { Toggle as TogglePrimitive } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/** Two-state button (aria-pressed); pressed shows in primary. Pair with `buttonVariants` for a filled look. */
export function Toggle({ className, ...props }: ComponentProps<typeof TogglePrimitive.Root>) {
  return (
    <TogglePrimitive.Root
      className={cn(
        "inline-flex cursor-pointer items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-60 data-[state=on]:text-primary",
        className,
      )}
      {...props}
    />
  );
}
