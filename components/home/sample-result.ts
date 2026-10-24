// Made-up example result, used on the home page (clearly labeled "Example") and the
// dev preview page, so we can show and style results without a paid analysis run.
import type { CoachingFeedback } from "@/lib/feedback/types";
import type { SpeechMetrics } from "@/lib/metrics/types";
import type { Transcript, TranscriptWord } from "@/lib/transcription/types";

const SAMPLE_TEXT = "Hi everyone, um, today I want to talk about why sleep matters for students. My first point. Most teens need about nine hours, uh, but the average is closer to seven. That gap hurts memory, mood and, um, grades.";
// Builds fake words 400 ms apart, with a 2.1 s gap after "point." to act as a pause.
// Each word lasts 300 ms, so the gap between words is 100 ms, except after "point.".
const sampleWords: TranscriptWord[] = [];
let clock = 0;
for (const text of SAMPLE_TEXT.split(" ")) {
  sampleWords.push({ text, start: clock, end: clock + 300, confidence: 0.95 });
  clock += text === "point." ? 2400 : 400;
}

export const sampleTranscript: Transcript = { text: SAMPLE_TEXT, words: sampleWords, durationMs: clock };

export const sampleMetrics: SpeechMetrics = {
  wordsPerMinute: 148,
  fillerCount: 3,
  // the start times of the "um," / "uh," / "um," words above, like findFillers would return
  fillers: sampleWords.filter((w) => /^(um|uh),?$/.test(w.text)).map((w) => ({ word: w.text.replace(",", ""), startMs: w.start })),
  pauses: [{ startMs: sampleWords.find((w) => w.text === "point.")!.end, durationMs: 2100 }],
};

export const sampleFeedback: CoachingFeedback = {
  summary: "A clear, well-organized opening with a strong statistic. Cutting a few fillers will make you sound even more confident.",
  strengths: ["You introduced your topic in the first sentence.", "The nine-hours vs seven-hours comparison is concrete and memorable."],
  improvements: [
    { area: "Filler words", tip: "Take a short breath instead of saying “um” before a new idea." },
    { area: "Pauses", tip: "Your 2-second pause after “My first point” was a little long; aim for about one second." },
  ],
};
