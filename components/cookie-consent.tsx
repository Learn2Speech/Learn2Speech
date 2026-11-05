"use client";
// Asks before we save optional preferences. The login cookie is strictly necessary (without it nobody
// can sign in), so it is always on; the sidebar-position cookie only gets written after "Accept".
import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const CONSENT_KEY = "l2s_cookie_choice";

export function hasCookieConsent(): boolean {
  try {
    return localStorage.getItem(CONSENT_KEY) === "all";
  } catch {
    return false;
  }
}

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
  // server snapshot "x" = hide during SSR so the banner never flashes for people who already chose
  const choice = useSyncExternalStore(subscribe, getChoice, () => "x");
  if (choice) return null;

  function save(value: "all" | "essential") {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch {}
    window.dispatchEvent(new Event("l2s-consent"));
  }

  return (
    // full-screen dim layer: the page stays behind it until a choice is made (like most sites)
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" aria-labelledby="cookie-title" className="w-full max-w-md rounded-2xl border bg-background p-6 shadow-xl">
        <h2 id="cookie-title" className="text-lg font-semibold">Cookies</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          We always use one cookie to keep you signed in. With your OK we also remember whether your sidebar is open. No ads, no tracking.{" "}
          {/* new tab, so the policy can be read without losing this choice */}
          <Link href="/privacy" target="_blank" className="underline underline-offset-4">Privacy Policy</Link>
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
          <Button autoFocus onClick={() => save("all")} className="h-10 sm:flex-1">Accept</Button>
          <Button variant="outline" onClick={() => save("essential")} className="h-10 sm:flex-1">Essential only</Button>
        </div>
      </div>
    </div>
  );
}
