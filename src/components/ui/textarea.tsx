import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export const textareaVariants = cva("w-full min-w-0 text-16 outline-none placeholder:text-placeholder", {
  variants: {
    variant: {
      field: "min-h-18 rounded-card bg-surface p-3 focus-visible:ring-2 focus-visible:ring-primary/30",
      bare: "resize-none bg-transparent",
    },
  },
  defaultVariants: { variant: "field" },
});

export function Textarea({
  className,
  variant,
  ...props
}: ComponentProps<"textarea"> & VariantProps<typeof textareaVariants>) {
  return <textarea className={cn(textareaVariants({ variant }), className)} {...props} />;
}
