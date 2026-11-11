"use client"; // the slider needs state
// The home page's interactive piece: a pace slider over the example speech.
// Drag it and the letters get narrower (talking fast squeezes more words into each line) or
// wider (talking slowly fits fewer). The rating next to the number is the same one the
// results page gives, from describePace. Filler words are set thin and orange.
import { useState } from "react";
import { describePace } from "@/lib/metrics/describe";
import type { SpeechMetrics } from "@/lib/metrics/types";
import type { TranscriptWord } from "@/lib/transcription/types";

const SLOWEST = 90; // words per minute at the slider's left end
const FASTEST = 220; // and at its right end
// Archivo's width axis runs from 62% (narrowest) to 125% (widest)
const NARROW = 62;
const WIDE = 125;

type Props = { metrics: SpeechMetrics; words: TranscriptWord[] };

export default function PaceSpecimen({ metrics, words }: Props) {
  const [wpm, setWpm] = useState(metrics.wordsPerMinute);
  const fillerStarts = new Set(metrics.fillers.map((f) => f.startMs));
  // slow = wide letters, fast = narrow letters
  const width = WIDE - ((wpm - SLOWEST) / (FASTEST - SLOWEST)) * (WIDE - NARROW);
  const rating = describePace(wpm).label;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-6 border-t border-foreground pt-2">
        <label htmlFor="pace" className="text-sm font-medium">
          Drag the pace
        </label>
        <input
          id="pace"
          type="range"
          min={SLOWEST}
          max={FASTEST}
          value={wpm}
          onChange={(e) => setWpm(Number(e.target.value))}
          aria-valuetext={`${wpm} words per minute, ${rating}`}
          className="pace-range min-w-40 flex-1"
        />
        <output htmlFor="pace" className="text-sm font-medium tabular-nums">
          {wpm} words/min <span className="text-muted-foreground">· {rating}</span>
        </output>
      </div>

      <p
        className="mt-1 text-[clamp(1.5rem,3.2vw,2.75rem)] leading-[1.2] font-semibold tracking-[-0.02em] text-pretty"
        style={{ fontStretch: `${width}%` }}
      >
        {words.map((word, i) => (
          <span key={i} className={fillerStarts.has(word.start) ? "font-thin text-highlight" : undefined}>
            {word.text}{" "}
          </span>
        ))}
      </p>
    </div>
  );
}
