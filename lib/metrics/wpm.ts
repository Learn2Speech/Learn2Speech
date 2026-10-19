import type { TranscriptWord } from "@/lib/transcription/types";

export function wordsPerMin(words: TranscriptWord[]): number {
  if (words.length === 0) return 0;         

  const first = words[0];                    
  const last = words[words.length - 1];      

  const totalMs = last.end - first.start; 
// We only want the website to calculate wpm for the time the person talks and not any other times before and after speaking.
  if (totalMs <= 0) return 0;            

  const mins = totalMs / 60_000;        
  return Math.round(words.length / mins);
}
