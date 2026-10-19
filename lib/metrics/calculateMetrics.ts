import type { Transcript } from "@/lib/transcription/types";
import type { SpeechMetrics } from "@/lib/metrics/types";
import { wordsPerMin } from "./wpm";
import { findFillers } from "./fillers";
import { findPauses } from "./pauses";

export function calculateMetrics(transcript: Transcript): SpeechMetrics {
  const words = transcript.words;
  const fillers = findFillers(words);
  return { wordsPerMinute: wordsPerMin(words), fillerCount: fillers.length, fillers: fillers, pauses: findPauses(words) }; 
}
