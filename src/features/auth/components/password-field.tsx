import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ICON_SIZE } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import type { AuthMode } from "./auth-screen";

export function PasswordField({
  mode,
  value,
  isVisible,
  onChange,
  onToggle,
}: {
  mode: AuthMode;
  value: string;
  isVisible: boolean;
  onChange: (value: string) => void;
  onToggle: () => void;
}) {
  return (
    <div className="relative mt-2">
      <Input
        id="password"
        type={isVisible ? "text" : "password"}
        required
        minLength={8}
        autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter password"
        className="pr-13"
      />
      <Button
        variant="ghost"
        size="bare"
        aria-label={isVisible ? "Hide password" : "Show password"}
        onClick={onToggle}
        className="absolute top-1/2 right-4 -translate-y-1/2 text-ink"
      >
        {isVisible ? (
          <EyeOff size={ICON_SIZE.lg} strokeWidth={1.6} aria-hidden />
        ) : (
          <Eye size={ICON_SIZE.lg} strokeWidth={1.6} aria-hidden />
        )}
      </Button>
    </div>
  );
}
