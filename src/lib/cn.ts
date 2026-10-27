import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Our @theme names (text-13, rounded-panel, ...) are unknown to tailwind-merge, which would otherwise
// treat `text-13` as a colour and drop it next to `text-white`.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        "12",
        "13",
        "legal",
        "14",
        "15",
        "16",
        "answer",
        "18",
        "20",
        "22",
        "26",
        "28",
        "30",
        "32",
        "36",
        "38",
        "44",
      ],
      radius: ["panel", "card", "field", "notice", "tab"],
      shadow: ["card-hover", "composer", "send"],
      leading: ["heading", "caption"],
      tracking: ["prompt", "answer"],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
