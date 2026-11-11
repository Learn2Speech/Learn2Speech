// Progress over time on the History page: one small line chart per metric,
// oldest recording on the left, newest on the right. Plain SVG, no chart library.
import type { SpeechMetrics } from "@/lib/metrics/types";

export type ProgressPoint = { createdAt: string; metrics: SpeechMetrics };

const CHARTS = [
  { label: "Words per minute", pick: (m: SpeechMetrics) => m.wordsPerMinute, hint: "130–160 is a comfortable pace" },
  { label: "Filler words", pick: (m: SpeechMetrics) => m.fillerCount, hint: "lower is better" },
  { label: "Long pauses", pick: (m: SpeechMetrics) => m.pauses.length, hint: "lower is better" },
];

const W = 240, H = 64, PAD = 6;

function Sparkline({ values }: { values: number[] }) {
  const min = Math.min(...values), max = Math.max(...values);
  const range = max - min || 1; // all the same → flat line instead of dividing by 0
  const x = (i: number) => PAD + (i * (W - 2 * PAD)) / (values.length - 1);
  const y = (v: number) => H - PAD - ((v - min) / range) * (H - 2 * PAD);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-16 w-full" aria-hidden="true">
      <polyline points={values.map((v, i) => `${x(i)},${y(v)}`).join(" ")} fill="none" stroke="currentColor"
        strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export default function ProgressChart({ points }: { points: ProgressPoint[] }) {
  if (points.length < 2) return null; // one recording isn't a trend yet
  return (
    <section aria-label="Your progress" className="mb-12 grid gap-3 sm:grid-cols-3">
      {CHARTS.map((chart) => {
        const values = points.map((p) => chart.pick(p.metrics));
        const first = values[0], latest = values[values.length - 1];
        return (
          <div key={chart.label} className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">{chart.label}</p>
            <p className="text-4xl font-black text-(--brand) tabular-nums">{latest}</p>
            <div className="text-brand"><Sparkline values={values} /></div>
            <p className="sr-only">Went from {first} to {latest} over {values.length} recordings.</p>
            <p className="text-xs text-muted-foreground">First: {first} · {chart.hint}</p>
          </div>
        );
      })}
    </section>
  );
}
