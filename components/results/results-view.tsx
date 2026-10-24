// Everything we show for one finished recording, in reading order:
// the numbers, then the coaching, then the transcript to look back at.
// Used by /history/[id]; built from parts so other pages can reuse them.
import FeedbackPanel from "@/components/results/feedback-panel";
import MetricsCards from "@/components/results/metrics-cards";
import TranscriptView from "@/components/results/transcript-view";
import type { CoachingFeedback } from "@/lib/feedback/types";
import type { SpeechMetrics } from "@/lib/metrics/types";
import type { Transcript } from "@/lib/transcription/types";

type ResultsViewProps = {
  metrics: SpeechMetrics;
  feedback: CoachingFeedback;
  transcript: Transcript;
};

export default function ResultsView({ metrics, feedback, transcript }: ResultsViewProps) {
  return (
    <div className="space-y-8">
      <MetricsCards metrics={metrics} durationMs={transcript.durationMs} />
      <FeedbackPanel feedback={feedback} />
      <TranscriptView transcript={transcript} metrics={metrics} />
    </div>
  );
}
