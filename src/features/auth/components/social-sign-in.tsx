import { AppleMark, GoogleMark } from "@/components/ui/brand-icons";
import { Separator } from "@/components/ui/separator";
import { SocialButton } from "./social-button";

export function SocialSignIn({
  providers,
  onPick,
}: {
  providers: { google: boolean; apple: boolean };
  onPick: (provider: "google" | "apple") => void;
}) {
  if (!providers.google && !providers.apple) return null;
  return (
    <>
      <div className="mt-6.5 flex items-center gap-4 text-13 text-muted sm:mx-8.5">
        <Separator className="flex-1" />
        Or better yet...
        <Separator className="flex-1" />
      </div>
      <div className="mt-6 flex flex-col gap-6">
        {providers.google && (
          <SocialButton onClick={() => onPick("google")} label="Continue with Google" icon={<GoogleMark />} />
        )}
        {providers.apple && (
          <SocialButton onClick={() => onPick("apple")} label="Continue with Apple" icon={<AppleMark />} />
        )}
      </div>
    </>
  );
}
