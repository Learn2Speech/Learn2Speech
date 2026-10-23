// Dev-only page for looking at the results components with made-up data,
// so we can style them without paying for a real transcription + feedback run.
// Delete this folder before submitting.
import MetricsCards from "@/components/results/metrics-cards";
import type { SpeechMetrics } from "@/lib/metrics/types";

const sampleMetrics: SpeechMetrics = {
  wordsPerMinute: 172,
  fillerCount: 3,
  fillers: [
    { word: "um", startMs: 2400 },
    { word: "like", startMs: 9100 },
    { word: "um", startMs: 15800 },
  ],
  pauses: [{ startMs: 6200, durationMs: 2100 }],
};

export default function ResultsPreviewPage() {
  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 px-4 py-10">
      <h1 className="text-2xl font-semibold">Results preview (sample data)</h1>
      <MetricsCards metrics={sampleMetrics} />
    </main>
  );
}
