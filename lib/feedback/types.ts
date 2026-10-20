// Shape of the coaching feedback Claude sends back for one recording.
// The prompt asks Claude for exactly these fields, the parser checks the reply
// matches them, and the UI and history display them. Change a field here and
// all three have to change with it.

// One specific thing to work on, plus what to actually do about it.
export type Improvement = {
  area: string; // short label for the UI, e.g. "Pace" or "Filler words"
  tip: string; // one concrete action the speaker can try next time
};

// Everything Claude tells the speaker about one recording.
export type CoachingFeedback = {
  summary: string; // 1–2 sentences on how the speech went overall
  strengths: string[]; // what went well, so feedback isn't only criticism
  improvements: Improvement[]; // the most important things to fix, best first
};
