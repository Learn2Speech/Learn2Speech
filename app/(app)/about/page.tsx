// /about: what Learn2Speech is, plus a link to our Congressional App Challenge video.
// A plain link instead of an embedded player, so YouTube loads nothing (and sets no cookies) until someone clicks.
import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Play } from "lucide-react";
import PageHeader from "@/components/page-header";

export const metadata: Metadata = { title: "About | Learn2Speech" };

const VIDEO_URL = "https://www.youtube.com/watch?v=4IKF0R3xr6Y";

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-10">
      <PageHeader title="About Learn2Speech" description="A speech coach that listens to your practice runs and tells you what to fix." />

      <a
        href={VIDEO_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="group mb-10 flex items-center gap-4 rounded-lg border border-foreground p-4 transition-colors hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-brand text-white">
          <Play aria-hidden="true" className="size-6 translate-x-0.5 fill-current" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold">Watch our Congressional App Challenge video</span>
          <span className="block text-sm text-muted-foreground">Learn2Speech, Congressional App Challenge 2026 (VA-02), on YouTube</span>
        </span>
        <ExternalLink aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" />
        <span className="sr-only">(opens in a new tab)</span>
      </a>

      <div className="space-y-6">
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">What the video covers</h2>
          <p className="leading-relaxed text-muted-foreground">
            We made Learn2Speech for the 2026 Congressional App Challenge in Virginia&apos;s 2nd District. The video
            explains why we built it and walks through the app: you record or upload a practice run of a speech,
            and a few minutes later you get back a transcript, your speaking pace, where your filler words and long
            pauses landed, and a coach&apos;s top suggestions for your next run.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Why we built it</h2>
          <p className="leading-relaxed text-muted-foreground">
            Most people only find out how they sound when it&apos;s too late: in class, in an interview, or on stage.
            Learn2Speech lets you practice on your own, as often as you want, and see what changes from one run to the next.
          </p>
        </section>
        <p className="text-sm text-muted-foreground">
          Want to try it without an account? Open the <Link href="/demo" className="font-medium text-foreground underline underline-offset-4">Tutorial</Link>.
          {" "}Questions: <a href="mailto:learn2speechteam@gmail.com" className="font-medium text-foreground underline underline-offset-4">learn2speechteam@gmail.com</a>
        </p>
      </div>
    </main>
  );
}
