"use client";
// A small notice at the bottom of the screen. We only use the login cookie, which is strictly
// necessary (without it nobody can sign in), so there is nothing to accept or refuse: we just tell people.
import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// same key as the old full-screen banner, so people who already chose don't see this again
const CONSENT_KEY = "l2s_cookie_choice";

function subscribe(onChange: () => void) {
  window.addEventListener("l2s-consent", onChange);
  return () => window.removeEventListener("l2s-consent", onChange);
}

function getChoice() {
  try {
    return localStorage.getItem(CONSENT_KEY) ?? "";
  } catch {
    return "";
  }
}

export default function CookieConsent() {
  // server snapshot "x" = hide during SSR so the notice never flashes for people who already closed it
  const choice = useSyncExternalStore(subscribe, getChoice, () => "x");
  if (choice) return null;

  function close() {
    try {
      localStorage.setItem(CONSENT_KEY, "seen");
    } catch {}
    window.dispatchEvent(new Event("l2s-consent"));
  }

  return (
    <div role="region" aria-label="Cookie notice" className="fixed inset-x-0 bottom-0 z-50 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto flex max-w-2xl flex-col gap-3 rounded-md border bg-background p-4 text-sm shadow-lg sm:flex-row sm:items-center">
        <p className="flex-1 leading-relaxed">
          We use one cookie to keep you signed in. No ads or tracking.{" "}
          <Link href="/privacy" className="font-medium text-foreground underline underline-offset-4">Privacy Policy</Link>
        </p>
        <Button onClick={close} className="h-11 sm:h-9">OK</Button>
      </div>
    </div>
  );
}
