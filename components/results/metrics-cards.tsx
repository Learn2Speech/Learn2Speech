// The three numbers we measured for one recording, as one panel with three columns, each with a
// rating ("Good pace", "Some fillers"...) from lib/metrics/describe.ts.
// Display only: the math and the ratings happen in lib/metrics, this just lays it out.
import { Card } from "@/components/ui/card";
import { describeFillers, describePace, describePauses, type Rating } from "@/lib/metrics/describe";
import type { SpeechMetrics } from "@/lib/metrics/types";

// A small dot beside the rating. Amber (not our accent) for "okay", so a warning never looks like a button.
const TONE_DOT: Record<Rating["tone"], string> = {
  good: "bg-green-600",
  okay: "bg-amber-500",
  bad: "bg-red-600",
};

type MetricProps = { label: string; value: number; unit: string; hint: string; rating: Rating };

function Metric({ label, value, unit, hint, rating }: MetricProps) {
  return (
    <div className="p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      {/* flex-wrap lets the unit drop below the number when the column is narrow */}
      <p className="mt-1 flex flex-wrap items-baseline gap-x-1.5 font-heading text-4xl font-medium tracking-[-0.03em] tabular-nums">
        {value}
        <span className="text-base font-normal tracking-normal whitespace-nowrap text-muted-foreground">{unit}</span>
      </p>
      <p className="mt-3 flex items-center gap-2 text-sm font-medium">
        <span aria-hidden="true" className={`size-2.5 rounded-full ring-2 ring-white ${TONE_DOT[rating.tone]}`} />
        {rating.label}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
    </div>
  );
}

// durationMs (the recording's length) lets the filler and pause ratings work per minute.
export default function MetricsCards({ metrics, durationMs }: { metrics: SpeechMetrics; durationMs: number }) {
  return (
    // gap-0: the columns share one border; on phones they stack with a line between
    <Card className="grid gap-0 divide-y py-0 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
      <Metric
        label="Pace"
        value={metrics.wordsPerMinute}
        unit="words/min"
        hint="How fast you spoke on average."
        rating={describePace(metrics.wordsPerMinute)}
      />
      <Metric
        label="Filler words"
        value={metrics.fillerCount}
        unit={metrics.fillerCount === 1 ? "filler" : "fillers"}
        hint="Sounds like “um”, “uh” and “hmm”."
        rating={describeFillers(metrics.fillerCount, durationMs)}
      />
      <Metric
        label="Long pauses"
        value={metrics.pauses.length}
        unit={metrics.pauses.length === 1 ? "pause" : "pauses"}
        hint="Silences over 1 second."
        rating={describePauses(metrics.pauses.length, durationMs)}
      />
    </Card>
  );
}
