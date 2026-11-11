// "Since last time": this recording's numbers next to the previous finished recording's,
// so you can see at a glance what improved. Fewer fillers and pauses is better; for pace
// faster isn't automatically better, so it gets a neutral color.
import type { SpeechMetrics } from "@/lib/metrics/types";

const ROWS = [
  { label: "Words/min", pick: (m: SpeechMetrics) => m.wordsPerMinute, lowerIsBetter: null },
  { label: "Fillers", pick: (m: SpeechMetrics) => m.fillerCount, lowerIsBetter: true },
  { label: "Long pauses", pick: (m: SpeechMetrics) => m.pauses.length, lowerIsBetter: true },
];

export default function SinceLastTime({ current, previous }: { current: SpeechMetrics; previous: SpeechMetrics }) {
  return (
    <section aria-label="Compared with your last recording" className="mb-8 rounded-lg border p-4">
      <p className="mb-2 text-sm font-medium">Since your last recording</p>
      <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm tabular-nums">
        {ROWS.map((row) => {
          const before = row.pick(previous), now = row.pick(current);
          const arrow = now > before ? "↑" : now < before ? "↓" : "=";
          // green when it moved the good way, red when it moved the bad way, gray otherwise
          const better = row.lowerIsBetter === null || now === before ? null : (now < before) === row.lowerIsBetter;
          const color = better === null ? "text-muted-foreground" : better ? "text-green-700 dark:text-green-500" : "text-destructive";
          return (
            <li key={row.label}>
              <span className="text-muted-foreground">{row.label}: </span>
              {before} → <span className="font-medium">{now}</span> <span className={color}>{arrow}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
