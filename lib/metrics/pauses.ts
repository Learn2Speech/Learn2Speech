import type {TranscriptWord} from "@/lib/transcription/types";
import type {Pause} from "@/lib/metrics/types";

// SUMMARY: finds long silences by comparing the end of each word with the start of the next one.
// A gap only counts as a pause if it is longer than 1 second; shorter gaps are normal breathing.
const MIN_MS = 1000;

// Starts the loop at 1 (not 0) because every word is compared with the one BEFORE it,
// and the very first word has nothing before it.
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