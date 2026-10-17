// Shapes of the data we get back from transcription.
// The metrics code (WPM, fillers, pauses) reads these, so changing a field here
// means checking every place that uses it.

// One spoken word. Times are in milliseconds because that's what AssemblyAI
// returns, so we never have to convert (and never mix up seconds vs ms).
export type TranscriptWord = {
  text: string;
  start: number; // ms from the start of the audio when the word begins
  end: number; // ms when the word ends
  confidence: number; // 0 to 1: how sure the transcriber is about this word
};

// The whole result for one recording.
export type Transcript = {
  text: string; // full transcript as one string, for showing to the user
  words: TranscriptWord[]; // every word in order, for calculating metrics
  durationMs: number; // total audio length, needed for words per minute
};
