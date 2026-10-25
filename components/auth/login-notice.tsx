"use client"; // reads ?from=... from the address bar
// When proxy.ts sends a logged-out visitor to /login, it adds ?from=upload (or history).
// This turns that into a friendly "Log in to use Upload" box on the login card.
import { useSearchParams } from "next/navigation";
import { LockKeyhole } from "lucide-react";

// Only pages we know about get a name, so a made-up ?from= value shows nothing.
const PAGE_NAMES: Record<string, string> = {
  upload: "Upload",
  history: "History",
};

export default function LoginNotice() {
  const from = useSearchParams().get("from");
  const pageName = from ? PAGE_NAMES[from] : undefined;
  if (!pageName) return null;

  return (
    <div className="space-y-2">
      {/* Known issue: right after logging in, Upload/History can bounce here until the page is reloaded.
          A plain <a> (not Next's <Link>) makes the browser fully reload, which skips the saved copy. */}
      <p className="text-sm text-muted-foreground">
        Already logged in?{" "}
        <a href={`/${from}`} className="font-medium text-foreground underline underline-offset-4">
          Try refreshing and open {pageName}
        </a>
      </p>
      <p role="status" className="flex items-center gap-2 rounded-md border border-primary/20 bg-accent px-3 py-2 text-sm text-accent-foreground">
        <LockKeyhole className="size-4 shrink-0" />
        Log in to use {pageName}.
      </p>
    </div>
  );
}
