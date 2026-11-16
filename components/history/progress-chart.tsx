// Progress over time on the History page: one small line chart per metric, oldest recording on the left,
// newest on the right. Each column says where you are now and whether that's better or worse than your
// first recording, so the chart answers "am I improving?" without reading the line. The pace chart shows
// the target range as a teal band (the same 120–160 range the results gauge uses). Plain SVG, no library.
import type { SpeechMetrics } from "@/lib/metrics/types";
import { DEFAULT_PACE } from "@/lib/topic/speech-types";
import { cn } from "@/lib/utils";

export type ProgressPoint = { createdAt: string; metrics: SpeechMetrics };

// how far a pace is outside the target range (0 = inside it)
const offPace = (wpm: number) => (wpm < DEFAULT_PACE.low ? DEFAULT_PACE.low - wpm : wpm > DEFAULT_PACE.high ? wpm - DEFAULT_PACE.high : 0);

const CHARTS = [
  {
    label: "Words per minute", name: "pace", pick: (m: SpeechMetrics) => m.wordsPerMinute, band: DEFAULT_PACE,
    hint: `Aim for ${DEFAULT_PACE.low}–${DEFAULT_PACE.high}`,
    score: offPace, // lower score = better
  },
  { label: "Filler words", name: "filler words", pick: (m: SpeechMetrics) => m.fillerCount, hint: "Lower is better", score: (n: number) => n },
  { label: "Long pauses", name: "long pauses", pick: (m: SpeechMetrics) => m.pauses.length, hint: "Lower is better", score: (n: number) => n },
];

const VERDICT = {
  better: { text: "Better", className: "text-green-700 dark:text-green-400" },
  worse: { text: "Worse", className: "text-destructive" },
  same: { text: "Same", className: "text-muted-foreground" },
};

const W = 300, H = 80, PAD = 8;

function Sparkline({ values, band }: { values: number[]; band?: { low: number; high: number } }) {
  // the band is part of the scale, so you can see how far outside it you were
  const min = Math.min(...values, ...(band ? [band.low - 10] : []));
  const max = Math.max(...values, ...(band ? [band.high + 10] : []));
  const range = max - min || 1; // all the same → flat line instead of dividing by 0
  const x = (i: number) => PAD + (i * (W - 2 * PAD)) / (values.length - 1);
  const y = (v: number) => H - PAD - ((v - min) / range) * (H - 2 * PAD);
  const last = values.length - 1;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full text-(--brand)" aria-hidden="true">
      {band && <rect x={0} width={W} y={y(band.high)} height={y(band.low) - y(band.high)} className="fill-current opacity-15" />}
      <polyline points={values.map((v, i) => `${x(i)},${y(v)}`).join(" ")} fill="none" stroke="currentColor"
        strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {values.map((v, i) => (
        <circle key={i} cx={x(i)} cy={y(v)} r={i === last ? 5 : 2.5} className="fill-current stroke-background" strokeWidth={i === last ? 2 : 0} />
      ))}
    </svg>
  );
}

type Direction = "better" | "worse" | "same";

// "pace", "pace and filler words", "pace, filler words and long pauses"
// "pace has" but "filler words have": plural when there are several, or the one name is plural
const plural = (names: string[]) => names.length > 1 || names[0].endsWith("s");
const join = (names: string[]) => (names.length < 2 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`);

// One or two plain sentences under the heading, written from the same verdicts as the columns (first vs
// latest recording), so the summary and the chart always agree. Code, not AI: instant, free, always matches.
function summary(directions: { name: string; direction: Direction }[]): string {
  const of = (d: Direction) => directions.filter((x) => x.direction === d).map((x) => x.name);
  const better = of("better"), worse = of("worse");
  if (better.length === directions.length) return `Great progress: your ${join(better)} are all better than your first recording. Keep it up.`;
  if (better.length && worse.length) return `Your ${join(better)} ${plural(better) ? "have" : "has"} improved since your first recording. Keep working on your ${join(worse)}.`;
  if (better.length) return `Your ${join(better)} ${plural(better) ? "have" : "has"} improved since your first recording, and nothing got worse.`;
  if (worse.length) return `Your ${join(worse)} ${plural(worse) ? "are" : "is"} not as good as your first recording yet. Pick one tip from your latest feedback and try it next time.`;
  return "About the same as your first recording. Try one tip from your latest feedback in your next practice.";
}

const shortDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });

// className: lets History drop the bottom margin when the chart sits in the pinnable wrapper
export default function ProgressChart({ points, title = "Your progress", className }: { points: ProgressPoint[]; title?: string; className?: string }) {
  const id = `progress-${title.toLowerCase().replace(/\W+/g, "-")}`;
  // one recording isn't a trend yet: keep the section so people know the charts are coming
  if (points.length < 2) {
    return (
      <section aria-labelledby={id} className={cn("mb-16 border-t border-foreground pt-6", className)}>
        <h2 id={id} className="text-2xl font-semibold">{title}</h2>
        <p className="mt-3 text-lg text-muted-foreground">
          Not enough recordings yet. Finish {points.length === 0 ? "2 recordings" : "1 more recording"} to see how you&apos;re improving.
        </p>
      </section>
    );
  }
  const firstDate = shortDate(points[0].createdAt), lastDate = shortDate(points[points.length - 1].createdAt);
  const rows = CHARTS.map((chart) => {
    const values = points.map((p) => chart.pick(p.metrics));
    const first = values[0], latest = values[values.length - 1];
    const diff = chart.score(latest) - chart.score(first);
    const direction: Direction = diff < 0 ? "better" : diff > 0 ? "worse" : "same";
    return { chart, values, first, latest, direction };
  });
  return (
    <section aria-labelledby={id} className={cn("mb-16 border-t border-foreground pt-6", className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2 id={id} className="text-2xl font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground tabular-nums">{points.length} recordings, {firstDate} to {lastDate}</p>
      </div>
      <p className="mt-3 max-w-[65ch] text-lg">{summary(rows.map((r) => ({ name: r.chart.name, direction: r.direction })))}</p>
      <div className="mt-6 grid divide-y border-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {rows.map(({ chart, values, first, latest, direction }) => {
          const verdict = VERDICT[direction];
          const moved = latest === first ? "no change" : `${latest > first ? "up" : "down"} ${Math.abs(latest - first)}`;
          return (
            <div key={chart.label} className="py-6 sm:px-6 sm:first:pl-0 sm:last:pr-0">
              <p className="text-sm font-medium text-muted-foreground">{chart.label}</p>
              <p className="mt-1 flex flex-wrap items-baseline gap-x-3">
                <span className="text-5xl leading-none font-black tracking-[-0.04em] text-(--brand) tabular-nums">{latest}</span>
                <span className="text-sm tabular-nums">
                  <span className={cn("font-semibold", verdict.className)}>{verdict.text}</span>
                  <span className="text-muted-foreground">, {moved} since your first</span>
                </span>
              </p>
              <div className="mt-4"><Sparkline values={values} band={chart.band} /></div>
              <p className="mt-1 flex justify-between text-xs text-muted-foreground"><span>{firstDate}</span><span>{lastDate}</span></p>
              <p className="mt-2 text-sm text-muted-foreground">{chart.hint}</p>
              <p className="sr-only">Went from {first} to {latest} over {values.length} recordings: {verdict.text.toLowerCase()}.</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
