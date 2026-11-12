// What a missing page shows, in the site's specimen style: one giant teal "404", a plain sentence, and a way back.
// Shown inside the top bar and footer when a page calls notFound() (e.g. a History link to a deleted recording);
// app/not-found.tsx reuses it for addresses that don't exist at all.
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto grid w-full max-w-7xl flex-1 content-center gap-10 px-6 py-16 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-center lg:gap-16">
      <p aria-hidden="true" className="text-[clamp(7rem,30vw,22rem)] leading-[0.75] font-black tracking-[-0.04em] text-(--brand) tabular-nums">
        404
      </p>
      <div>
        <h1 className="text-4xl leading-[1.02] font-semibold sm:text-5xl">This page doesn&apos;t exist.</h1>
        <p className="mt-4 max-w-[38ch] text-lg text-muted-foreground">
          The link may be mistyped, or the recording it pointed to was deleted.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/" className={buttonVariants({ size: "lg", className: "h-12 px-6" })}>
            Go to the home page
          </Link>
          <Link href="/demo" className={buttonVariants({ size: "lg", variant: "outline", className: "h-12 border-foreground/30! px-6" })}>
            Try the tutorial
          </Link>
        </div>
      </div>
    </main>
  );
}
