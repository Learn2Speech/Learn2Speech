// Top of the home page: a full-width teal block. The headline and the one orange button sit above
// a live demo of the product (the example speech playing back on its timeline), so the first
// screen shows what the app does instead of describing it.
import Link from "next/link";
import LiveDemo from "@/components/home/live-demo";
import { sampleMetrics, sampleTranscript } from "@/components/home/sample-result";
import MetricsCards from "@/components/results/metrics-cards";
import { buttonVariants } from "@/components/ui/button";

export default function Hero() {
  return (
    <section>
      <div className="on-teal bg-teal">
        <div className="mx-auto max-w-6xl px-6 py-10 sm:py-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] lg:items-end lg:gap-16">
            <h1 className="text-5xl leading-[1.02] sm:text-6xl lg:text-7xl">Hear your speech the way the room does.</h1>
            <div>
              <p className="text-lg text-muted-foreground">
                Upload a practice run. You get your pace, every filler word and every long pause, placed on a timeline.
              </p>
              {/* prefetch={false}: these pages need a login, see the note in components/site-nav.tsx */}
              <Link href="/upload" prefetch={false} className={buttonVariants({ size: "lg", className: "mt-6" })}>
                Upload a practice run
              </Link>
            </div>
          </div>

          <div className="mt-8 sm:mt-8">
            <p className="mb-5 text-sm text-muted-foreground">Example: an 18-second practice run about sleep, played back</p>
            <LiveDemo metrics={sampleMetrics} durationMs={sampleTranscript.durationMs} words={sampleTranscript.words} />
          </div>
        </div>
      </div>

      <div className="mx-auto mt-14 max-w-6xl px-6">
        <MetricsCards metrics={sampleMetrics} durationMs={sampleTranscript.durationMs} />
      </div>
    </section>
  );
}
