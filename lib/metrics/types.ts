// Shapes of the metrics we calculate from a Transcript.
// The feedback prompt and the history page both read these, so this is the
// contract between "do the math" and "show / explain the math".

// One filler word the speaker said, and when, so the UI can point to it.
export type FillerHit = {
  word: string; // e.g. "um", "like"
  startMs: number; // when it was said, ms from the start of the audio
};

// One silence between two words that was long enough to count as a pause.
export type Pause = {
  startMs: number; // when the silence began (the end of the word before it)
  durationMs: number; // how long the silence lasted
};

// Everything we measured for one recording.
export type SpeechMetrics = {
  wordsPerMinute: number; // rounded to a whole number
  fillerCount: number; // same as fillers.length, kept for easy display
  fillers: FillerHit[];
  pauses: Pause[];
};
