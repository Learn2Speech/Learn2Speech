// The full transcript, with the filler words and long pauses our metrics found
// marked right where they happened, so the speaker can see *where* to improve.
// It doesn't detect anything itself: it matches the timestamps from SpeechMetrics.
import { Pause } from "lucide-react";
import type { SpeechMetrics } from "@/lib/metrics/types";
import type { Transcript } from "@/lib/transcription/types";

export default function TranscriptView({ transcript, metrics }: { transcript: Transcript; metrics: SpeechMetrics }) {
  // A filler's startMs is the start time of the word it came from, so a Set of
  // those times lets us check each word in one step.
  const fillerStarts = new Set(metrics.fillers.map((filler) => filler.startMs));
  // A pause starts where the word before it ends, so key them by that end time.
  const pausesAfter = new Map(metrics.pauses.map((pause) => [pause.startMs, pause.durationMs]));

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-2">
        <h2 className="text-2xl font-semibold sm:text-3xl">Transcript</h2>
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <mark className="rounded bg-highlight/30 px-1 text-foreground">um</mark> filler word
          </span>
          <span className="flex items-center gap-1.5">
            <PauseMarker durationMs={1500} /> long pause
          </span>
        </p>
      </div>
      {/* scrolls on its own so a long speech doesn't push everything else down.
          tabIndex lets keyboard users scroll it. */}
      <div tabIndex={0} className="mt-6 max-h-[32rem] overflow-y-auto border-y py-5 text-xl leading-[1.7] sm:text-2xl sm:leading-[1.65]">
        {transcript.words.length === 0
          ? transcript.text
          : transcript.words.map((word, i) => {
              const pause = pausesAfter.get(word.end);
              return (
                <span key={i}>
                  {fillerStarts.has(word.start) ? (
                    <mark className="rounded bg-highlight/30 px-1 font-medium text-foreground">{word.text}</mark>
                  ) : (
                    word.text
                  )}
                  {pause !== undefined && <PauseMarker durationMs={pause} />}{" "}
                </span>
              );
            })}
      </div>
    </div>
  );
}

// A small pill like "2.1s" showing how long a silence lasted.
function PauseMarker({ durationMs }: { durationMs: number }) {
  return (
    <span className="mx-1 inline-flex items-center gap-1 rounded-full border border-dashed border-muted-foreground/60 px-2 align-middle text-xs leading-5 text-muted-foreground">
      <Pause aria-hidden="true" className="size-3" /> {(durationMs / 1000).toFixed(1)}s
    </span>
  );
}
