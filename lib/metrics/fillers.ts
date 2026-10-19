import type { TranscriptWord } from "@/lib/transcription/types";
import type {FillerHit} from "@/lib/metrics/types";

const FILLER_WORDS = ["um", "uh", "hmm", "eh", "err", "ah"];

export function findFillers(words: TranscriptWord[]): FillerHit[] {
  const fillers: FillerHit[] = [];                  

  for (const word of words) {              
    const cleaned = word.text
      .toLowerCase()                             
      .replace(/[^a-z']/g, "");                 

    if (FILLER_WORDS.includes(cleaned)) {                 
      fillers.push({ word: cleaned, startMs: word.start }); 
    }
  }
  return fillers;
}