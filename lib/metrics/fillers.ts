import type { TranscriptWord } from "@/lib/transcription/types";
import type {FillerHit} from "@/lib/metrics/types";

// SUMMARY: finds filler words ("um", "uh"...) in the transcript and records when each was said.
// Only single-word fillers are counted. "like" is left out on purpose because it is often a
// normal word ("I like this idea"), so counting it would punish correct speech.
const FILLER_WORDS = ["um", "uh", "hmm", "eh", "err", "ah"];

// AssemblyAI is told to keep fillers in the transcript (disfluencies: true), otherwise they
// would be removed before we could count them.
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