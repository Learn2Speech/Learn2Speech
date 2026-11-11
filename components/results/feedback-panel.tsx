// Shows Claude's coaching feedback for one recording: what went well, and the most important
// things to work on (best first). The one-paragraph summary sits at the top of the results
// (see results-view.tsx). Display only: the prompt and parsing live in lib/feedback.
import type { CoachingFeedback } from "@/lib/feedback/types";

export default function FeedbackPanel({ feedback }: { feedback: CoachingFeedback }) {
  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
      <div>
        <h2 className="text-2xl font-semibold sm:text-3xl">What went well</h2>
        <ul className="mt-6 divide-y border-y">
          {feedback.strengths.map((strength, i) => (
            <li key={i} className="py-4 text-lg">
              {strength}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-2xl font-semibold sm:text-3xl">What to work on</h2>
        {/* numbered because Claude puts the most important improvement first */}
        <ol className="mt-6 divide-y border-y">
          {feedback.improvements.map((item, i) => (
            <li key={i} className="grid grid-cols-[auto_1fr] gap-x-5 py-5">
              <span aria-hidden="true" className="text-5xl leading-[0.85] font-black text-(--brand) tabular-nums">
                {i + 1}
              </span>
              <div>
                <p className="text-lg font-semibold">{item.area}</p>
                <p className="mt-1 text-muted-foreground">{item.tip}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
