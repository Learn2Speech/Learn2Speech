"use client";
// Asks before we save optional preferences. The login cookie is strictly necessary (without it nobody
// can sign in), so it is always on; the sidebar-position cookie only gets written after "Accept".
import { useSyncExternalStore } from "react";
import Link from "next/link";
import Logo from "@/components/brand/logo";
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
    // full-screen dim layer: the page stays behind it until a choice is made (like BBC, Reddit, Spotify)
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="cookie-title" className="max-h-full w-full max-w-lg overflow-y-auto rounded-md bg-background px-6 py-8 text-center shadow-xl sm:px-10">
        <Logo className="justify-center text-3xl" />
        <h2 id="cookie-title" className="mt-5 text-base font-semibold">Cookies and your privacy</h2>
        <p className="mt-3 text-sm leading-relaxed">
          We always use one cookie to keep you signed in. With your OK, we also use a cookie to remember whether your sidebar is open. We don&apos;t use ads or tracking.
        </p>
        <p className="mt-3 text-sm leading-relaxed">
          You can read more in our{" "}
          {/* new tab, so the policy can be read without losing this choice */}
          <Link href="/privacy" target="_blank" className="font-medium text-brand underline underline-offset-4">Privacy Policy</Link>.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Button autoFocus onClick={() => save("all")} className="h-12 w-full rounded-full text-base">Accept all</Button>
          <Button variant="outline" onClick={() => save("essential")} className="h-12 w-full rounded-full text-base">Essential cookies only</Button>
        </div>
      </div>
    </div>
  );
}
