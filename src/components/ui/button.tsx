import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full transition outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-default disabled:opacity-60",
  {
    variants: {
      variant: {
        primary: "bg-primary text-white hover:brightness-110",
        dark: "bg-ink text-white",
        outline: "border border-line text-ink-2 hover:bg-field",
        surface: "bg-surface text-ink-2",
        soft: "bg-surface-2 text-icon hover:bg-surface",
        ghost: "",
        link: "text-primary hover:underline",
        card: "flex-col items-stretch justify-start rounded-card bg-card text-left hover:shadow-card-hover",
      },
      size: {
        lg: "h-15 px-6 text-15",
        md: "h-12.5 px-5 text-15",
        sm: "h-8.5 px-3 text-13",
        "icon-lg": "size-12.5",
        "icon-md": "size-11",
        icon: "size-9",
        bare: "",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonProps = ComponentProps<"button"> & VariantProps<typeof buttonVariants>;

/** Every clickable control in the app; `type` defaults to "button" so nothing submits a form by accident. */
export function Button({ className, variant, size, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
