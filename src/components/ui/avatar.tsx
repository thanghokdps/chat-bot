"use client";

import { useState } from "react";

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0] ?? "";
  const last = parts.length > 1 ? (parts.at(-1) ?? "") : "";
  const letters = last ? `${first[0] ?? ""}${last[0] ?? ""}` : first.slice(0, 2);
  return letters.toUpperCase() || "?";
}

export function Avatar({ name, image, size }: { name: string; image: string | null; size: number }) {
  const [failedImage, setFailedImage] = useState<string | null>(null);
  if (image && image !== failedImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- OAuth avatars come from arbitrary provider hosts
      <img
        src={image}
        alt=""
        width={size}
        height={size}
        // Google's photo host refuses requests whose Referer is another site (e.g. localhost).
        referrerPolicy="no-referrer"
        onError={() => setFailedImage(image)}
        className="shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      className="flex shrink-0 items-center justify-center rounded-full bg-primary-100 font-medium text-primary"
    >
      {initials(name)}
    </span>
  );
}
