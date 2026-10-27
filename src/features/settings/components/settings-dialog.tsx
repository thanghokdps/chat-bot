"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ICON_SIZE } from "@/components/ui/icon";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { authClient } from "@/features/auth";
import { BACKGROUNDS } from "@/lib/backgrounds";
import type { Background } from "@/lib/types";

const SWATCH: Record<Background, string> = {
  gray: "var(--bg-gray)",
  blue: "var(--bg-blue)",
  pink: "var(--bg-pink)",
  yellow: "var(--bg-yellow)",
  green: "var(--bg-green)",
};

function isBackground(value: string): value is Background {
  return (BACKGROUNDS as readonly string[]).includes(value);
}

export function SettingsDialog({
  background,
  onChange,
  onClose,
}: {
  background: Background;
  onChange: (background: Background) => void;
  onClose: () => void;
}) {
  return (
    <Dialog open onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent aria-describedby={undefined} closeLabel="Close settings">
        <DialogTitle className="text-20 font-medium">Settings</DialogTitle>
        <p id="background-label" className="mt-5 text-13 text-muted">
          Background
        </p>
        <RadioGroup
          value={background}
          onValueChange={(value) => isBackground(value) && onChange(value)}
          aria-labelledby="background-label"
          className="mt-2.5"
        >
          {BACKGROUNDS.map((b) => (
            <RadioGroupItem key={b} value={b} aria-label={b} style={{ background: SWATCH[b] }} className="size-10" />
          ))}
        </RadioGroup>
        <Button
          variant="outline"
          onClick={async () => {
            await authClient.signOut();
            window.location.assign(new URL("/sign-in", window.location.origin));
          }}
          className="mt-7 h-11.5 w-full"
        >
          <LogOut size={ICON_SIZE.sm} aria-hidden /> Sign out
        </Button>
      </DialogContent>
    </Dialog>
  );
}
