// The whole recording on one time axis. The bars are real: each one is how much of that slice of
// time you were actually speaking (from the word timestamps), so silences show up as gaps and
// filler words as orange bars. A ruler sits underneath. On load a thin line sweeps across once
// and uncovers it (the one animation in the app, CSS only, skipped for reduced motion).
// Display only: fillers and pauses come from lib/metrics.
import type { SpeechMetrics } from "@/lib/metrics/types";
import type { TranscriptWord } from "@/lib/transcription/types";

// 75000 ms -> "1:15"
function formatTime(ms: number) {
  const totalSeconds = Math.round(ms / 1000);
  return `${Math.floor(totalSeconds / 60)}:${(totalSeconds % 60).toString().padStart(2, "0")}`;
}

export const BINS = 72;

// how much of each slice of the recording had a word being spoken, 0 to 1
export function voicedBins(words: TranscriptWord[], durationMs: number) {
  const binMs = durationMs / BINS;
  const voiced = new Array<number>(BINS).fill(0);
  for (const word of words) {
    const first = Math.floor(word.start / binMs);
    const last = Math.min(BINS - 1, Math.floor(word.end / binMs));
    for (let i = first; i <= last; i++) {
      const overlap = Math.min(word.end, (i + 1) * binMs) - Math.max(word.start, i * binMs);
      voiced[i] = Math.min(1, voiced[i] + Math.max(0, overlap) / binMs);
    }
  }
  return voiced;
}

type Props = { metrics: SpeechMetrics; durationMs: number; words?: TranscriptWord[] };

export default function SpeechTimeline({ metrics, durationMs, words = [] }: Props) {
  if (!durationMs) return null; // nothing to draw for an empty recording

  const binMs = durationMs / BINS;
  const voiced = voicedBins(words, durationMs);
  const fillerBins = new Set(metrics.fillers.map((f) => Math.min(BINS - 1, Math.floor(f.startMs / binMs))));
  const toPercent = (ms: number) => `${Math.min(100, (ms / durationMs) * 100)}%`;

  // a tick about every 5 seconds for short clips, coarser for long ones
  const stepMs = durationMs <= 60000 ? 5000 : durationMs <= 300000 ? 30000 : 60000;
  const ticks: number[] = [];
  for (let t = 0; t <= durationMs; t += stepMs) ticks.push(t);

  return (
    <figure aria-label="Speech timeline">
      <div className="relative">
        <div className="scan-reveal">
          <div className="relative flex h-24 items-end gap-[2px]">
            {voiced.map((level, i) => (
              <span
                key={i}
                className={`flex-1 rounded-[1px] ${fillerBins.has(i) ? "bg-highlight" : "bg-teal-mark"}`}
                // floor of 6% so quiet slices still show as a faint bar and silence reads as the gap it is
                style={{ height: `${Math.max(level > 0 ? 12 + level * 88 : 3, 3)}%`, opacity: level > 0 ? 1 : 0.35 }}
              />
            ))}
            {metrics.pauses.map((pause, i) => (
              <span
                key={`p${i}`}
                title={`${(pause.durationMs / 1000).toFixed(1)}s pause at ${formatTime(pause.startMs)}`}
                className="absolute -bottom-3 flex h-2 items-center justify-center border-x border-muted-foreground"
                style={{ left: toPercent(pause.startMs), width: toPercent(pause.durationMs) }}
              >
                <span className="h-px w-full bg-muted-foreground" />
              </span>
            ))}
          </div>
        </div>
        {/* the sweeping line; its own box is the full width so translateX(-100%) to 0 spans the timeline */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-full">
          <div className="scan-line h-full w-full border-r border-foreground" />
        </div>
      </div>

      {/* ruler */}
      <div aria-hidden="true" className="relative mt-6 h-5 border-t border-border">
        {ticks.map((t) => (
          <span key={t} className="absolute top-0 -translate-x-1/2 first:translate-x-0 last:-translate-x-full" style={{ left: toPercent(t) }}>
            <span className="mx-auto block h-1.5 w-px bg-muted-foreground" />
            <span className="mt-0.5 block font-mono text-[11px] tabular-nums text-muted-foreground">{formatTime(t)}</span>
          </span>
        ))}
      </div>

      <figcaption className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-muted-foreground">
        <span className="flex items-center gap-2"><span className="h-3 w-1 rounded-[1px] bg-highlight" /> filler word</span>
        <span className="flex items-center gap-2"><span className="h-3 w-1 rounded-[1px] bg-teal-mark" /> speaking</span>
        <span className="flex items-center gap-2"><span className="h-2 w-4 border-x border-muted-foreground" /> long pause</span>
      </figcaption>
    </figure>
  );
}
