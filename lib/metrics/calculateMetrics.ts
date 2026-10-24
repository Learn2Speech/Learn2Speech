// SUMMARY: the one entry point for all speech math. It takes a transcript (words with
// timestamps) and returns the three measurements the app shows: pace, filler words, pauses.
// Each measurement lives in its own small file so it can be tested and explained alone.
import type { Transcript } from "@/lib/transcription/types";
import type { SpeechMetrics } from "@/lib/metrics/types";
import { wordsPerMin } from "./wpm";
import { findFillers } from "./fillers";
import { findPauses } from "./pauses";

export function calculateMetrics(transcript: Transcript): SpeechMetrics {
  const words = transcript.words;
  // fillers is a list, not a number, because the results page needs to know WHEN each one happened
  const fillers = findFillers(words);
  return { wordsPerMinute: wordsPerMin(words), fillerCount: fillers.length, fillers: fillers, pauses: findPauses(words) }; 
}
