// The three numbers we measured, each plotted on its own scale so you can see where you landed
// against the target, instead of a bare number. The bands below are the same cutoffs
// lib/metrics/describe.ts uses for the rating, so the picture and the words always agree.
// Display only: the math and the ratings live in lib/metrics.
import { describeFillers, describePace, describePauses, type Rating } from "@/lib/metrics/describe";
import type { SpeechMetrics } from "@/lib/metrics/types";

type Band = { to: number; tone: Rating["tone"] };

// good = filled with the teal mark color, okay = a mid wash, bad = a faint wash
const BAND_STYLE: Record<Rating["tone"], string> = {
  good: "bg-teal-mark",
  okay: "bg-foreground/30",
  bad: "bg-foreground/12",
};

function Gauge({ value, min, max, bands }: { value: number; min: number; max: number; bands: Band[] }) {
  const pct = (n: number) => `${((Math.min(Math.max(n, min), max) - min) / (max - min)) * 100}%`;
  return (
    <div aria-hidden="true" className="relative mt-5 h-1.5">
      {bands.map((band, i) => {
        const from = i === 0 ? min : bands[i - 1].to; // each band starts where the one before ends
        const width = `${((band.to - from) / (max - min)) * 100}%`;
        return <span key={i} className={`absolute inset-y-0 ${BAND_STYLE[band.tone]}`} style={{ left: pct(from), width }} />;
      })}
      {/* where you landed */}
      <span className="absolute -top-1.5 h-[18px] w-0.5 -translate-x-1/2 bg-orange" style={{ left: pct(value) }} />
    </div>
  );
}

type ReadoutProps = {
  label: string;
  value: number;
  unit: string;
  rating: Rating;
  target: string;
  gauge: { value: number; min: number; max: number; bands: Band[] };
};

function Readout({ label, value, unit, rating, target, gauge }: ReadoutProps) {
  return (
    <div className="py-6 sm:px-6 sm:first:pl-0 sm:last:pr-0">
      <p className="text-sm text-muted-foreground">{label}</p>
      {/* flex-wrap lets the unit drop below the number when the column is narrow */}
      <p className="mt-2 flex flex-wrap items-baseline gap-x-2 font-heading text-5xl font-medium tracking-[-0.04em]"> 
        {value}
        <span className="text-sm font-normal tracking-normal whitespace-nowrap text-muted-foreground">{unit}</span>
      </p>
      <Gauge {...gauge} />
      <p className="mt-4 font-medium">{rating.label}</p>
      <p className="text-sm text-muted-foreground">{target}</p>
    </div>
  );
}

const perMinute = (count: number, durationMs: number) => (durationMs ? count / (durationMs / 60000) : 0);
const oneDecimal = (n: number) => (Math.round(n * 10) / 10).toString();

// durationMs (the recording's length) lets the filler and pause ratings work per minute.
export default function MetricsCards({ metrics, durationMs }: { metrics: SpeechMetrics; durationMs: number }) {
  const fillerRate = perMinute(metrics.fillerCount, durationMs);
  const pauseRate = perMinute(metrics.pauses.length, durationMs);
  return (
    <div className="grid divide-y border-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
      <Readout
        label="Pace"
        value={metrics.wordsPerMinute}
        unit="words / min"
        rating={describePace(metrics.wordsPerMinute)}
        target="Comfortable: 120 to 160"
        gauge={{
          value: metrics.wordsPerMinute, min: 60, max: 220,
          bands: [{ to: 100, tone: "bad" }, { to: 120, tone: "okay" }, { to: 160, tone: "good" }, { to: 180, tone: "okay" }, { to: 220, tone: "bad" }],
        }}
      />
      <Readout
        label="Filler words"
        value={metrics.fillerCount}
        unit={metrics.fillerCount === 1 ? "filler" : "fillers"}
        rating={describeFillers(metrics.fillerCount, durationMs)}
        target={`${oneDecimal(fillerRate)} per minute. Few: 2 or less`}
        gauge={{ value: fillerRate, min: 0, max: 12, bands: [{ to: 2, tone: "good" }, { to: 5, tone: "okay" }, { to: 12, tone: "bad" }] }}
      />
      <Readout
        label="Long pauses"
        value={metrics.pauses.length}
        unit={metrics.pauses.length === 1 ? "pause" : "pauses"}
        rating={describePauses(metrics.pauses.length, durationMs)}
        target={`${oneDecimal(pauseRate)} per minute. Steady: 4 or less`}
        gauge={{ value: pauseRate, min: 0, max: 12, bands: [{ to: 4, tone: "good" }, { to: 8, tone: "okay" }, { to: 12, tone: "bad" }] }}
      />
    </div>
  );
}
