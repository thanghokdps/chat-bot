"use client";

import { Plus, ThumbsUp } from "lucide-react";
import { type ReactNode, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { AppleMark, GoogleMark } from "@/components/ui/brand-icons";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ICON_SIZE } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";

const VARIANTS = ["primary", "dark", "outline", "surface", "soft", "ghost", "link"] as const;
const SIZES = ["lg", "md", "sm"] as const;
const ICON_SIZES = ["icon-lg", "icon-md", "icon"] as const;

function Row({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-13 text-muted">{title}</h2>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </section>
  );
}

/** Every primitive in every variant, size and state, on the page background (docs/design/ui-map.md). */
export function PrimitivesGallery() {
  const [isPressed, setIsPressed] = useState(true);
  const [swatch, setSwatch] = useState("gray");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <main className="mx-auto flex max-w-238 flex-col gap-8 p-6 sm:p-10">
      <h1 className="text-28 font-medium">Primitives</h1>
      {SIZES.map((size) => (
        <Row key={size} title={`Button · size ${size}`}>
          {VARIANTS.map((variant) => (
            <Button key={variant} variant={variant} size={size}>
              {variant}
            </Button>
          ))}
          <Button size={size} disabled>
            disabled
          </Button>
        </Row>
      ))}
      <Row title="Button · icon sizes">
        {ICON_SIZES.map((size) => (
          <Button key={size} variant="dark" size={size} aria-label={size}>
            <Plus size={ICON_SIZE.md} aria-hidden />
          </Button>
        ))}
        <Button variant="card" size="bare" className="h-28 w-48 p-2.5">
          card
        </Button>
      </Row>
      <Row title="Input · field / pill / bare">
        <div className="w-72">
          <Label htmlFor="gallery-field">Label*</Label>
          <Input id="gallery-field" placeholder="field" className="mt-2" />
        </div>
        <Input variant="pill" placeholder="pill" className="w-60" />
        <Input variant="bare" placeholder="bare" className="w-40" />
      </Row>
      <Row title="Textarea · field / bare">
        <Textarea placeholder="field" className="w-72" />
        <Textarea variant="bare" rows={1} placeholder="bare" className="w-40" />
      </Row>
      <Row title="Toggle · on / off · Separator">
        <div className="flex h-8.5 items-center gap-2.5 rounded-full bg-surface px-3 text-icon">
          <Toggle aria-label="on" pressed={isPressed} onPressedChange={setIsPressed}>
            <ThumbsUp size={ICON_SIZE.sm} aria-hidden />
          </Toggle>
          <Separator orientation="vertical" className="bg-toolbar-rule data-[orientation=vertical]:h-3.5" />
          <Toggle aria-label="off" pressed={!isPressed} onPressedChange={(p) => setIsPressed(!p)}>
            <ThumbsUp size={ICON_SIZE.sm} aria-hidden />
          </Toggle>
        </div>
        <Separator className="w-40" />
      </Row>
      <Row title="RadioGroup (swatches)">
        <RadioGroup value={swatch} onValueChange={setSwatch} aria-label="Swatch">
          {["gray", "blue", "pink", "yellow", "green"].map((b) => (
            <RadioGroupItem
              key={b}
              value={b}
              aria-label={b}
              style={{ background: `var(--bg-${b})` }}
              className="size-10"
            />
          ))}
        </RadioGroup>
      </Row>
      <Row title="Avatar · photo / initials · Brand marks · Icon scale">
        <Avatar name="Andrew Neilson" image="/brand/sample-avatar.png" size={34} />
        <Avatar name="Andrew Neilson" image={null} size={34} />
        <GoogleMark />
        <AppleMark />
        {Object.entries(ICON_SIZE).map(([name, px]) => (
          <span key={name} className="flex items-center gap-1 text-12 text-muted">
            <Plus size={px} aria-hidden /> {name}
          </span>
        ))}
      </Row>
      <Row title="Dialog · Sheet">
        <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
          Open dialog
        </Button>
        <Button variant="outline" onClick={() => setIsSheetOpen(true)}>
          Open sheet
        </Button>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent aria-describedby={undefined}>
            <DialogTitle className="text-20 font-medium">Dialog</DialogTitle>
          </DialogContent>
        </Dialog>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent className="w-drawer rounded-panel bg-surface p-7.5">
            <SheetTitle className="text-20 font-medium">Sheet</SheetTitle>
          </SheetContent>
        </Sheet>
      </Row>
    </main>
  );
}
