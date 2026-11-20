import type { TranscriptWord } from "@/lib/transcription/types";

// SUMMARY: words per minute = number of words / minutes spent speaking.
// Time is measured from the first word's start to the last word's end, so silence before
// and after the speech doesn't make a fast speaker look slow.
export function wordsPerMin(words: TranscriptWord[]): number {
  if (words.length === 0) return 0;         

  const first = words[0];                    
  const last = words[words.length - 1];      

  const totalMs = last.end - first.start; 
// We only want the website to calculate wpm for the time the person talks and not any other times before and after speaking.
  // Under 5 seconds of speech the pace isn't meaningful (2 words in 0.4 s would read as 300). 0 means
  // "too short to measure": the results page, History and the prompt all show it that way.
  if (totalMs < 5000) return 0;            

  const mins = totalMs / 60_000;        
  return Math.round(words.length / mins);
}
