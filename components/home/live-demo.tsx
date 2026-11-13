"use client"; // runs a looping timer to play the example back
// The home page's centerpiece: the example speech "plays" on a loop. A line sweeps the timeline,
// bars fill in behind it, the transcript lights up word by word, and the filler and pause
// counts tick up as the line passes them. It shows what the product does without a screenshot.
// Reduced motion: no loop, the finished result is shown. Data is the same sample as the results view.
import { useEffect, useRef, useState } from "react";
import { BINS, voicedBins } from "@/components/results/speech-timeline";
import type { SpeechMetrics } from "@/lib/metrics/types";
import type { TranscriptWord } from "@/lib/transcription/types";

const SPEED = 1.6; // plays faster than real time so the loop stays short
const HOLD_MS = 2600; // how long the finished result stays before it restarts

type Props = { metrics: SpeechMetrics; durationMs: number; words: TranscriptWord[] };

export default function LiveDemo({ metrics, durationMs, words }: Props) {
  const voiced = voicedBins(words, durationMs);
  const binMs = durationMs / BINS;
  const fillerStarts = new Set(metrics.fillers.map((f) => f.startMs));
  const fillerBins = new Set(metrics.fillers.map((f) => Math.min(BINS - 1, Math.floor(f.startMs / binMs))));

  // playhead in recording time (ms); -1 = not started, durationMs = finished
  const [now, setNow] = useState(-1);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // show the finished result right away, with no loop
      const id = requestAnimationFrame(() => setNow(durationMs));
      return () => cancelAnimationFrame(id);
    }
    const playMs = durationMs / SPEED;
    let start = performance.now();
    let frame = 0;
    let lastBin = -2;
    const tick = (time: number) => {
      const elapsed = time - start;
      const t = Math.min(durationMs, elapsed * SPEED);
      // the line moves every frame; React state only changes when the playhead enters a new slice
      if (lineRef.current) lineRef.current.style.transform = `translateX(${(t / durationMs) * 100 - 100}%)`;
      const bin = Math.floor(t / binMs);
      if (bin !== lastBin) {
        lastBin = bin;
        setNow(t);
      }
      if (elapsed > playMs + HOLD_MS) {
        start = time;
        lastBin = -2;
        setNow(-1);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [durationMs, binMs]);

  const seen = (ms: number) => now >= ms;
  const fillersSoFar = metrics.fillers.filter((f) => seen(f.startMs)).length;
  const pausesSoFar = metrics.pauses.filter((p) => seen(p.startMs)).length;
  const shownBin = now < 0 ? -1 : Math.floor(now / binMs);

  return (
    <div>
      {/* the text version, for screen readers: the animation below is decoration */}
      <p className="sr-only">
        An example result: {metrics.wordsPerMinute} words per minute, {metrics.fillerCount} filler words and{" "}
        {metrics.pauses.length} long pause in an 18-second practice run.
      </p>

      <div aria-hidden="true">
        <div className="relative">
          <div className="flex h-28 items-end gap-[3px] sm:h-28">
            {voiced.map((level, i) => (
              <span
                key={i}
                className={`flex-1 rounded-[1px] transition-opacity duration-150 ease-out ${fillerBins.has(i) ? "bg-highlight" : "bg-teal-mark"}`}
                style={{ height: `${level > 0 ? 14 + level * 86 : 3}%`, opacity: i <= shownBin ? (level > 0 ? 1 : 0.35) : 0.12 }}
              />
            ))}
          </div>
          {/* the playhead: a 1px line that spans the full width, moved with transform only */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-full overflow-hidden">
            <div ref={lineRef} className="h-full w-full border-r border-foreground" style={{ transform: "translateX(-100%)" }} />
          </div>
        </div>

        {/* live counters */}
        <div className="mt-5 flex flex-wrap items-end gap-x-10 gap-y-4 border-t pt-5">
          <p className="text-sm text-muted-foreground">
            Fillers <span className="ml-1 text-3xl font-medium inline-block min-w-[1ch] text-foreground">{fillersSoFar}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Long pauses <span className="ml-1 text-3xl font-medium inline-block min-w-[1ch] text-foreground">{pausesSoFar}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Pace <span className="ml-1 text-3xl font-medium inline-block min-w-[1ch] text-foreground">{metrics.wordsPerMinute}</span> words/min
          </p>
        </div>

        {/* the transcript lights up as the playhead passes each word */}
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-pretty sm:text-xl">
          {words.map((word, i) => {
            const lit = seen(word.start);
            const filler = fillerStarts.has(word.start);
            return (
              <span
                key={i}
                className={`transition-colors duration-150 ease-out ${lit ? "text-foreground" : "text-muted-foreground"} ${lit && filler ? "bg-highlight/30" : ""}`}
              >
                {word.text}{" "}
              </span>
            );
          })}
        </p>
      </div>
    </div>
  );
}
