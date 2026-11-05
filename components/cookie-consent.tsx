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
    <div role="region" aria-label="Cookie notice" className="fixed inset-x-4 bottom-4 z-50 rounded-xl sm:left-auto sm:max-w-sm border bg-background p-4 shadow-lg">
      <p className="text-sm">
        We always use one cookie to keep you signed in. With your OK we also remember whether your sidebar is open. No ads, no tracking.{" "}
        <Link href="/privacy" className="underline underline-offset-4">Privacy</Link>
      </p>
      <div className="mt-3 flex gap-2">
        <Button onClick={() => save("all")}>Accept</Button>
        <Button variant="outline" onClick={() => save("essential")}>Essential only</Button>
      </div>
    </div>
  );
}
