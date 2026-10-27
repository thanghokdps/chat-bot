import type { ReactNode } from "react";

/** Scrolling column under the floating composer; the side padding keeps text clear of the Upgrade tab. */
export function ChatScroll({ children }: { children: ReactNode }) {
  return <div className="thread-fade absolute inset-0 overflow-y-auto px-4 sm:px-6 lg:px-gutter-tab">{children}</div>;
}
