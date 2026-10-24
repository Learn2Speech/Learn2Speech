// Top of the home page: a dark "ink" band with who the app is for and what it shows,
// then a real example result (our actual results components with sample data)
// overlapping the bottom edge, so visitors see the product instead of a slogan.
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Waveform from "@/components/brand/waveform";
import { sampleMetrics, sampleTranscript } from "@/components/home/sample-result";
import MetricsCards from "@/components/results/metrics-cards";
import SpeechTimeline from "@/components/results/speech-timeline";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Hero() {
  return (
    <section>
      <div className="relative overflow-hidden bg-ink text-ink-foreground">
        <Waveform className="absolute inset-x-0 bottom-0 h-28 opacity-40" barClassName="bg-ink-accent/30" />
        <div className="relative mx-auto max-w-5xl px-6 pt-16 pb-40 md:pt-24">
          <h1 className="max-w-2xl text-4xl leading-[1.05] font-bold sm:text-6xl">
            See exactly where your speech <span className="text-ink-accent">stumbles</span>.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-ink-foreground/75">
            Upload a practice run of your class presentation, debate case or interview answer. Learn2Speech
            times your pace, finds every &ldquo;um&rdquo; and long pause, and tells you what to fix before the real thing.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Link href="/upload" className={cn(buttonVariants({ size: "lg" }), "h-11 px-5 text-base")}>
              Upload a practice run <ArrowRight />
            </Link>
            <Link href="/history" className="text-base font-medium text-ink-foreground/80 underline-offset-4 hover:text-ink-foreground hover:underline">
              See your past recordings
            </Link>
          </div>
        </div>
      </div>

      {/* the real results components with made-up data, pulled up over the dark band */}
      <div className="relative mx-auto -mt-28 max-w-5xl px-6">
        <div className="space-y-4 rounded-xl border bg-background p-4 shadow-xl sm:p-6">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Example result</span> · an 18-second practice run about sleep
          </p>
          <MetricsCards metrics={sampleMetrics} durationMs={sampleTranscript.durationMs} />
          <SpeechTimeline metrics={sampleMetrics} durationMs={sampleTranscript.durationMs} />
        </div>
      </div>
    </section>
  );
}
