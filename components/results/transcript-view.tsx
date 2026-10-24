// The full transcript, with the filler words and long pauses our metrics found
// marked right where they happened, so the speaker can see *where* to improve.
// It doesn't detect anything itself: it matches the timestamps from SpeechMetrics.
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { SpeechMetrics } from "@/lib/metrics/types";
import type { Transcript } from "@/lib/transcription/types";

export default function TranscriptView({ transcript, metrics }: { transcript: Transcript; metrics: SpeechMetrics }) {
  // A filler's startMs is the start time of the word it came from, so a Set of
  // those times lets us check each word in one step.
  const fillerStarts = new Set(metrics.fillers.map((filler) => filler.startMs));
  // A pause starts where the word before it ends, so key them by that end time.
  const pausesAfter = new Map(metrics.pauses.map((pause) => [pause.startMs, pause.durationMs]));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transcript</CardTitle>
        <CardDescription className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="flex items-center gap-1.5">
            <mark className="rounded bg-highlight/20 px-1">um</mark> filler word
          </span>
          <span className="flex items-center gap-1.5">
            <PauseMarker durationMs={1500} /> long pause
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* scrolls on its own so a long speech doesn't push everything else down */}
        <div className="max-h-96 overflow-y-auto rounded-lg bg-muted/50 p-4 text-[15px] leading-8">
          {transcript.words.length === 0
            ? transcript.text
            : transcript.words.map((word, i) => {
                const pause = pausesAfter.get(word.end);
                return (
                  <span key={i}>
                    {fillerStarts.has(word.start) ? (
                      <mark className="rounded bg-highlight/20 px-1 font-medium">{word.text}</mark>
                    ) : (
                      word.text
                    )}
                    {pause !== undefined && <PauseMarker durationMs={pause} />}{" "}
                  </span>
                );
              })}
        </div>
      </CardContent>
    </Card>
  );
}

// A small pill like "2.1s" showing how long a silence lasted.
function PauseMarker({ durationMs }: { durationMs: number }) {
  return (
    <span className="mx-1 inline-flex items-center rounded-full border border-dashed border-muted-foreground/40 px-1.5 align-middle text-xs leading-5 text-muted-foreground">
      ⏸ {(durationMs / 1000).toFixed(1)}s
    </span>
  );
}
