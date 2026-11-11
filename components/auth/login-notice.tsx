"use client"; // reads ?from=... from the address bar
// When proxy.ts sends a logged-out visitor to /login, it adds ?from=upload (or record, history).
// This turns that into a friendly "Log in to use Upload" box on the login card.
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { createClient } from "@/lib/supabase";

// Only pages we know about get a name, so a made-up ?from= value shows nothing (and can't redirect anywhere else).
export const PAGE_NAMES: Record<string, string> = {
  // both are "Practice" in the top bar
  upload: "Practice",
  record: "Practice",
  history: "History",
};

export default function LoginNotice() {
  const from = useSearchParams().get("from");
  // hasOwn: so ?from=constructor (a built-in object key) doesn't count as a page
  const pageName = from && Object.hasOwn(PAGE_NAMES, from) ? PAGE_NAMES[from] : undefined;

  // Already logged in but bounced here by an old pre-loaded "go to login" answer? Go straight back.
  // A full page load (not router.push) skips that saved answer.
  useEffect(() => {
    if (!pageName) return;
    createClient().auth.getUser().then(({ data }) => {
      if (data.user) window.location.replace(`/${from}`);
    });
  }, [from, pageName]);

  if (!pageName) return null;

  return (
    <p role="status" className="flex items-center gap-2 rounded-md border border-brand/20 bg-accent px-3 py-2 text-sm text-accent-foreground">
      <LockKeyhole className="size-4 shrink-0" />
      Log in to use {pageName}.
    </p>
  );
}
