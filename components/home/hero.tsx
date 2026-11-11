// Top of the home page: a plain headline and one button on white, then a full-width teal block
// with a real example result (our actual results components with sample data), so visitors
// see the product, not a slogan.
import Link from "next/link";
import { sampleMetrics, sampleTranscript } from "@/components/home/sample-result";
import MetricsCards from "@/components/results/metrics-cards";
import SpeechTimeline from "@/components/results/speech-timeline";
import { buttonVariants } from "@/components/ui/button";

export default function Hero() {
  return (
    <section>
      <div className="mx-auto max-w-5xl px-6 pt-16 md:pt-24">
        <h1 className="max-w-3xl text-4xl leading-[1.05] sm:text-6xl">Hear what your audience hears.</h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">
          Upload a practice run of your presentation, debate case or interview answer. Learn2Speech times your pace,
          finds every &ldquo;um&rdquo; and long pause, and tells you the three things to fix.
        </p>
        {/* prefetch={false}: these pages need a login, see the note in components/site-nav.tsx */}
        <div className="mt-8 flex flex-wrap items-center gap-6">
          <Link href="/upload" prefetch={false} className={buttonVariants({ size: "lg" })}>
            Upload a practice run
          </Link>
          <Link href="/history" prefetch={false} className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            Past recordings
          </Link>
        </div>
      </div>

      <div className="on-teal mt-16 bg-teal py-12 md:py-16">
        <div className="mx-auto max-w-5xl space-y-4 px-6">
          <p className="text-sm text-muted-foreground">An example result, from an 18-second practice run about sleep.</p>
          <MetricsCards metrics={sampleMetrics} durationMs={sampleTranscript.durationMs} />
          <SpeechTimeline metrics={sampleMetrics} durationMs={sampleTranscript.durationMs} />
        </div>
      </div>
    </section>
  );
}
