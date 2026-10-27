"use client";

import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function RadioGroup({ className, ...props }: ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return <RadioGroupPrimitive.Root className={cn("flex flex-wrap gap-3", className)} {...props} />;
}

/** Unstyled beyond focus and checked rings: the swatch or card it wraps is the visual. */
export function RadioGroupItem({ className, ...props }: ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      className={cn(
        "cursor-pointer rounded-full border border-hairline outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-60 data-[state=checked]:border-primary data-[state=checked]:ring-2 data-[state=checked]:ring-primary/30",
        className,
      )}
      {...props}
    />
  );
}
