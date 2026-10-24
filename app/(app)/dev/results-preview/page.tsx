// Dev-only page for looking at the results components with made-up data,
// so we can style them without paying for a real transcription + feedback run.
// Delete this folder before submitting.
import ResultsView from "@/components/results/results-view";
import type { CoachingFeedback } from "@/lib/feedback/types";
import type { SpeechMetrics } from "@/lib/metrics/types";
import type { Transcript, TranscriptWord } from "@/lib/transcription/types";

// Builds fake words 400 ms apart, with a 2.1 s gap after "point." to act as a pause.
const SAMPLE_TEXT = "Hi everyone, um, today I want to talk about why sleep matters for students. My first point. Most teens need about nine hours, uh, but the average is closer to seven. That gap hurts memory, mood and, um, grades.";
const sampleWords: TranscriptWord[] = [];
let clock = 0;
for (const text of SAMPLE_TEXT.split(" ")) {
  sampleWords.push({ text, start: clock, end: clock + 300, confidence: 0.95 });
  clock += text === "point." ? 2400 : 400;
}

const sampleTranscript: Transcript = { text: SAMPLE_TEXT, words: sampleWords, durationMs: clock };

const sampleMetrics: SpeechMetrics = {
  wordsPerMinute: 148,
  fillerCount: 3,
  // the start times of the "um," / "uh," / "um," words above, like findFillers would return
  fillers: sampleWords.filter((w) => /^(um|uh),?$/.test(w.text)).map((w) => ({ word: w.text.replace(",", ""), startMs: w.start })),
  pauses: [{ startMs: sampleWords.find((w) => w.text === "point.")!.end, durationMs: 2100 }],
};

const sampleFeedback: CoachingFeedback = {
  summary: "A clear, well-organized opening with a strong statistic. Cutting a few fillers will make you sound even more confident.",
  strengths: ["You introduced your topic in the first sentence.", "The nine-hours vs seven-hours comparison is concrete and memorable."],
  improvements: [
    { area: "Filler words", tip: "Take a short breath instead of saying “um” before a new idea." },
    { area: "Pauses", tip: "Your 2-second pause after “My first point” was a little long; aim for about one second." },
  ],
};

export default function ResultsPreviewPage() {
  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 px-6 py-10">
      <h1 className="text-2xl font-semibold">Results preview (sample data)</h1>
      <ResultsView metrics={sampleMetrics} feedback={sampleFeedback} transcript={sampleTranscript} />
    </main>
  );
}
