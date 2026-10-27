import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function SocialButton({ label, icon, onClick }: { label: string; icon: ReactNode; onClick: () => void }) {
  return (
    <Button variant="outline" size="lg" onClick={onClick} className="w-full gap-2.5 border-hairline font-medium">
      {icon}
      {label}
    </Button>
  );
}
