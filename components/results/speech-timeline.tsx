// The whole recording as one bar, left = start, right = end, with a mark for every
// filler word and a shaded block for every long pause, so you can see at a glance
// *when* things went wrong (e.g. all the "um"s are in the first 20 seconds).
// Display only: the fillers and pauses come from Rian's metrics.
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { SpeechMetrics } from "@/lib/metrics/types";

// 75000 ms -> "1:15"
function formatTime(ms: number) {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function SpeechTimeline({ metrics, durationMs }: { metrics: SpeechMetrics; durationMs: number }) {
  if (!durationMs) return null; // nothing to draw for an empty recording

  // where something happened, as a % of the bar's width
  const toPercent = (ms: number) => `${Math.min(100, (ms / durationMs) * 100)}%`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your speech, start to finish</CardTitle>
        <CardDescription className="flex flex-wrap items-center gap-x-5 gap-y-1">
          <span className="flex items-center gap-1.5">
            <span className="h-3.5 w-1 rounded-full bg-highlight" /> filler word
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3.5 w-4 rounded-sm bg-ink/20" /> long pause
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* "relative" on the bar + "absolute" on each mark lets us place a mark at any % along it.
            Pauses are drawn first so the filler marks sit on top of them. */}
        <div className="relative h-12 overflow-hidden rounded-md bg-muted">
          {metrics.pauses.map((pause, i) => (
            <span
              key={`p${i}`}
              title={`${(pause.durationMs / 1000).toFixed(1)}s pause at ${formatTime(pause.startMs)}`}
              className="absolute inset-y-0 bg-ink/20"
              style={{ left: toPercent(pause.startMs), width: toPercent(pause.durationMs) }}
            />
          ))}
          {metrics.fillers.map((filler, i) => (
            <span
              key={`f${i}`}
              title={`“${filler.word}” at ${formatTime(filler.startMs)}`}
              className="absolute inset-y-2 w-1 -translate-x-1/2 rounded-full bg-highlight"
              style={{ left: toPercent(filler.startMs) }}
            />
          ))}
        </div>
        <div className="mt-2 flex justify-between text-xs text-muted-foreground tabular-nums">
          <span>0:00</span>
          <span>{formatTime(durationMs / 2)}</span>
          <span>{formatTime(durationMs)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
