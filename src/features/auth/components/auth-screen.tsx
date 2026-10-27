"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/features/auth/auth-client";
import { PasswordField } from "./password-field";
import { SocialSignIn } from "./social-sign-in";

export type AuthMode = "sign-up" | "sign-in";

const COPY = {
  "sign-up": {
    title: "Sign up with free trail",
    subtitle: "Empower your experience, sign up for a free account today",
    submit: "Get started free",
    switchText: "Already have an account?",
    switchLink: "Login",
    switchHref: "/sign-in",
  },
  "sign-in": {
    title: "Welcome back",
    subtitle: "Log in to continue your conversations",
    submit: "Login",
    switchText: "New to CHAT A.I+?",
    switchLink: "Sign up",
    switchHref: "/sign-up",
  },
} as const;

/** Display name for email sign-ups: the design's form has no name field. */
export function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "";
  const words = local.split(/[._-]+/).filter(Boolean);
  return words.map((w) => w[0]?.toUpperCase() + w.slice(1)).join(" ") || "Friend";
}

export function AuthScreen({ mode, providers }: { mode: AuthMode; providers: { google: boolean; apple: boolean } }) {
  const copy = COPY[mode];
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsBusy(true);
    const result =
      mode === "sign-up"
        ? await authClient.signUp.email({ email, password, name: nameFromEmail(email), callbackURL: "/" })
        : await authClient.signIn.email({ email, password, callbackURL: "/" });
    setIsBusy(false);
    if (result.error) {
      setError(result.error.message ?? "Something went wrong. Please try again.");
      return;
    }
    window.location.assign(new URL("/", window.location.origin));
  }

  async function social(provider: "google" | "apple") {
    setError(null);
    const result = await authClient.signIn.social({ provider, callbackURL: "/" });
    if (result.error) setError(result.error.message ?? `Could not continue with ${provider}.`);
  }

  return (
    <div className="flex min-h-dvh bg-surface">
      <div className="relative hidden w-1/2 lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element -- hero artwork cropped from the design */}
        <img src="/brand/sign-up-hero.png" alt="" className="absolute inset-0 size-full object-cover object-left" />
        <h2 className="sr-only">CHAT A.I+ — Learn, Discover &amp; Automate in One Place.</h2>
      </div>

      <main className="flex flex-1 justify-center px-6">
        <div className="w-full max-w-130 pt-auth-top pb-12">
          <p className="logo-type mb-7 text-center text-22 leading-none text-ink lg:hidden">CHAT A.I+</p>
          <h1 className="text-center text-30 leading-tight font-medium text-ink sm:text-38">{copy.title}</h1>
          <p className="mt-3.5 text-center text-16 text-ink-3">{copy.subtitle}</p>

          <form onSubmit={submit} className="mt-9 sm:mt-12.5">
            <Label htmlFor="email">Email Address*</Label>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ex. email@domain.com"
              className="mt-2"
            />

            <Label htmlFor="password" className="mt-6 block">
              Password*
            </Label>
            <PasswordField
              mode={mode}
              value={password}
              isVisible={isPasswordVisible}
              onChange={setPassword}
              onToggle={() => setIsPasswordVisible(!isPasswordVisible)}
            />

            {mode === "sign-up" && (
              <p className="mt-7.75 text-14 leading-4.75 text-ink-2 sm:pr-6">
                By registering for an account, you are consenting to our{" "}
                <Link href="/terms" className="text-primary underline">
                  Terms of Service
                </Link>{" "}
                and confirming that you have reviewed and accepted the{" "}
                <Link href="/privacy" className="text-primary">
                  Global Privacy Statement.
                </Link>
              </p>
            )}

            {error && (
              <p role="alert" className="mt-4 text-13 text-danger">
                {error}
              </p>
            )}

            <Button type="submit" size="lg" disabled={isBusy} className="mt-6.5 w-full">
              {copy.submit}
            </Button>
          </form>

          <p className="mt-5.5 text-center text-16 leading-5.5 text-ink-2">
            {copy.switchText}{" "}
            <Link href={copy.switchHref} className="text-primary">
              {copy.switchLink}
            </Link>
          </p>

          <SocialSignIn providers={providers} onPick={(p) => void social(p)} />
        </div>
      </main>
    </div>
  );
}
