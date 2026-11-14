// Everything we show for one finished recording, in reading order: the headline finding in giant
// type (the filler word you said most, or your pace if you used none), the three numbers, where
// things happened, the coaching, then the transcript to look back at.
// Used by /history/[id] and by the tutorial at /demo. Each part has a data-tour name so the
// tutorial (components/tour.tsx) can point at it.
import FeedbackPanel from "@/components/results/feedback-panel";
import ImpromptuReview from "@/components/results/impromptu-review";
import MetricsCards from "@/components/results/metrics-cards";
import SpeechTimeline from "@/components/results/speech-timeline";
import TranscriptView from "@/components/results/transcript-view";
import type { CoachingFeedback } from "@/lib/feedback/types";
import type { FillerHit, SpeechMetrics } from "@/lib/metrics/types";
import type { Transcript } from "@/lib/transcription/types";
import type { ImpromptuInfo } from "@/lib/impromptu/topics";

type ResultsViewProps = {
  metrics: SpeechMetrics;
  feedback: CoachingFeedback;
  transcript: Transcript;
  impromptu?: ImpromptuInfo | null; // set on impromptu runs: shows the topic and the topic/structure/time checks
};

// The filler word said most often, with how many times; null when there were none.
function topFiller(fillers: FillerHit[]) {
  const counts = new Map<string, number>();
  for (const filler of fillers) counts.set(filler.word, (counts.get(filler.word) ?? 0) + 1);
  let top: { word: string; count: number } | null = null;
  for (const [word, count] of counts) if (!top || count > top.count) top = { word, count };
  return top;
}

export default function ResultsView({ metrics, feedback, transcript, impromptu }: ResultsViewProps) {
  const top = topFiller(metrics.fillers);
  const big = top ? top.word : String(metrics.wordsPerMinute);
  return (
    <div className="space-y-16">
      <section data-tour="headline" className="grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-center lg:gap-12">
        {/* decoration: the heading next to it says the same thing. --len sizes the type so any word fits. */}
        <p
          aria-hidden="true"
          style={{ "--len": big.length } as React.CSSProperties}
          className="um-in -ml-[0.04em] py-[0.08em] text-[length:calc(105vw/var(--len))] leading-[0.75] font-black tracking-[-0.04em] whitespace-nowrap text-(--brand) select-none lg:text-[length:min(calc(54rem/var(--len)),calc(58vw/var(--len)))]"
        >
          {big}
        </p>
        <div className="rise-in">
          <h2 className="text-3xl leading-[1.05] font-semibold sm:text-4xl">
            {top
              ? `You said “${top.word}” ${top.count === 1 ? "once" : `${top.count} times`}.`
              : `${metrics.wordsPerMinute} words per minute, and not one filler word.`}
          </h2>
          <p className="mt-4 max-w-[52ch] text-lg text-muted-foreground">{feedback.summary}</p>
        </div>
      </section>

      <section data-tour="metrics">
        <MetricsCards metrics={metrics} durationMs={transcript.durationMs} />
      </section>

      {/* the teal block (the 30): the recording from start to finish */}
      <section data-tour="timeline" className="on-teal rounded-lg bg-teal p-6 sm:p-10">
        <h2 className="mb-8 text-2xl font-semibold sm:text-3xl">Where it happened</h2>
        <SpeechTimeline metrics={metrics} durationMs={transcript.durationMs} words={transcript.words} />
      </section>

      {impromptu && (
        <section aria-label="Impromptu checks">
          <ImpromptuReview topic={impromptu.topic} targetSeconds={impromptu.targetSeconds} durationMs={transcript.durationMs} review={feedback.impromptu} />
        </section>
      )}

      <section data-tour="feedback">
        <FeedbackPanel feedback={feedback} />
      </section>

      <section data-tour="transcript">
        <TranscriptView transcript={transcript} metrics={metrics} />
      </section>
    </div>
  );
}
