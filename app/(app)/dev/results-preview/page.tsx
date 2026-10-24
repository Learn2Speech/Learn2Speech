// Dev-only page for looking at the results components with made-up data,
// so we can style them without paying for a real transcription + feedback run.
// Delete this folder before submitting.
import { sampleFeedback, sampleMetrics, sampleTranscript } from "@/components/home/sample-result";
import ResultsView from "@/components/results/results-view";

export default function ResultsPreviewPage() {
  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 px-6 py-10">
      <h1 className="text-2xl font-semibold">Results preview (sample data)</h1>
      <ResultsView metrics={sampleMetrics} feedback={sampleFeedback} transcript={sampleTranscript} />
    </main>
  );
}
