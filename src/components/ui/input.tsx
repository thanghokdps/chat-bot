import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

// 16px text below lg stops iOS Safari zooming into the field on focus.
export const inputVariants = cva("w-full min-w-0 text-16 outline-none placeholder:text-placeholder", {
  variants: {
    variant: {
      field: "h-14 rounded-field bg-field px-3.5 focus-visible:ring-2 focus-visible:ring-primary/30 sm:h-15 lg:text-14",
      pill: "h-10 rounded-full bg-field px-4 focus-visible:ring-2 focus-visible:ring-primary/30 lg:text-14",
      bare: "bg-transparent",
    },
  },
  defaultVariants: { variant: "field" },
});

export function Input({ className, variant, ...props }: ComponentProps<"input"> & VariantProps<typeof inputVariants>) {
  return <input className={cn(inputVariants({ variant }), className)} {...props} />;
}
