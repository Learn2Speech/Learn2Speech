import type {TranscriptWord} from "@/lib/transcription/types";
import type {Pause} from "@/lib/metrics/types";

const MIN_MS = 1000;

export function findPauses(words: TranscriptWord[]): Pause[] {
  const pauses: Pause[] = [];

  for (let i = 1; i < words.length; i++) {  
    const previous = words[i - 1];
    const current = words[i];

    const gap = current.start - previous.end;  
    if (gap > MIN_MS) {
      pauses.push({ startMs: previous.end, durationMs: gap });
    }
  }
  return pauses;
}