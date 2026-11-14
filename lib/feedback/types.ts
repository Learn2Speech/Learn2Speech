// Shape of the coaching feedback Claude sends back for one recording.
// The prompt asks Claude for exactly these fields, the parser checks the reply
// matches them, and the UI and history display them. Change a field here and
// all three have to change with it.
import type { SpeechMetrics } from "@/lib/metrics/types";

// One specific thing to work on, plus what to actually do about it.
export type Improvement = {
  area: string; // short label for the UI, e.g. "Pace" or "Filler words"
  tip: string; // one concrete action the speaker can try next time
};

// One impromptu check: a three-step rating plus a sentence or two explaining it.
export type ImpromptuRating = "strong" | "okay" | "weak";
export type ImpromptuCheck = {
  rating: ImpromptuRating;
  comment: string;
};

// Extra judging for impromptu runs only (see lib/impromptu/topics.ts and migration 0008).
export type ImpromptuReview = {
  onTopic: ImpromptuCheck; // did the speech answer the topic it was given?
  structure: ImpromptuCheck & {
    opening: boolean; // a clear opening that states the speaker's answer or idea
    mainPoints: number; // how many distinct supporting points Claude found
    closing: boolean; // a clear conclusion instead of just trailing off
  };
  timeUse: ImpromptuCheck; // rating worked out in code from the length; Claude writes the comment
};

// Everything Claude tells the speaker about one recording.
export type CoachingFeedback = {
  summary: string; // 1–2 sentences on how the speech went overall
  strengths: string[]; // what went well, so feedback isn't only criticism
  improvements: Improvement[]; // the most important things to fix, best first
  impromptu?: ImpromptuReview; // only on impromptu runs (older recordings and uploads don't have it)
};

export type FeedbackCall = {
  metrics: SpeechMetrics; 
  feedback: CoachingFeedback;
};
