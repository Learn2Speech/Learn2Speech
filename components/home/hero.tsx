// Top of the home page. The first thing you see is the product's own output (a real timeline and
// transcript from sample data), with a short headline beside it, not a slogan on its own.
import Link from "next/link";
import { sampleMetrics, sampleTranscript } from "@/components/home/sample-result";
import MetricsCards from "@/components/results/metrics-cards";
import SpeechTimeline from "@/components/results/speech-timeline";
import { buttonVariants } from "@/components/ui/button";

// the sample words with the fillers marked, as a single readable line
function SampleLine() {
  const fillerStarts = new Set(sampleMetrics.fillers.map((f) => f.startMs));
  return (
    <p className="max-w-prose text-pretty leading-relaxed text-muted-foreground">
      {sampleTranscript.words.map((word, i) => (
        <span key={i}>
          {fillerStarts.has(word.start) ? <mark className="bg-highlight/25 px-0.5 text-foreground">{word.text}</mark> : word.text}{" "}
        </span>
      ))}
    </p>
  );
}

export default function Hero() {
  return (
    <section>
      <div className="mx-auto grid max-w-6xl gap-10 px-6 pt-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16 lg:pt-24">
        <div className="self-end">
          <h1 className="text-4xl leading-[1.04] sm:text-5xl lg:text-6xl">Hear your speech the way the room does.</h1>
          <p className="mt-6 max-w-md text-lg text-muted-foreground">
            Upload a practice run. You get your pace, every filler word and every long pause, placed on a timeline.
          </p>
          {/* prefetch={false}: these pages need a login, see the note in components/site-nav.tsx */}
          <Link href="/upload" prefetch={false} className={buttonVariants({ size: "lg", className: "mt-8" })}>
            Upload a practice run
          </Link>
        </div>

        {/* the one big block of teal: a real result, labeled as an example */}
        <div className="on-teal space-y-6 bg-teal p-6 sm:p-8">
          <p className="text-sm text-muted-foreground">Example: an 18-second run about sleep</p>
          <SpeechTimeline metrics={sampleMetrics} durationMs={sampleTranscript.durationMs} words={sampleTranscript.words} />
          <SampleLine />
        </div>
      </div>

      <div className="mx-auto mt-14 max-w-6xl px-6">
        <MetricsCards metrics={sampleMetrics} durationMs={sampleTranscript.durationMs} />
      </div>
    </section>
  );
}
