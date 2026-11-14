// Script mode, results page: how the speech compared with the pasted script. The numbers come from
// lib/script/compare-script.ts (code), the comment and tips from Claude. Display only.
import { describePace } from "@/lib/metrics/describe";
import type { ScriptReview as Review } from "@/lib/script/types";
import type { PaceRange } from "@/lib/topic/speech-types";

export default function ScriptReview({ review, pace }: { review: Review; pace?: PaceRange }) {
  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
      <div>
        <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">Your script</p>
        <h2 className="mt-2 text-3xl leading-[1.1] font-semibold sm:text-4xl">
          You said <span className="text-(--brand) tabular-nums">{review.coverage}%</span> of your script.
        </h2>
        <p className="mt-2 text-muted-foreground tabular-nums">{review.scriptWords} words in the script.</p>
        {review.comment && <p className="mt-4 max-w-[52ch] text-lg text-muted-foreground">{review.comment}</p>}
      </div>

      <div className="space-y-10">
        {review.sections.length > 1 && (
          <div>
            <h3 className="text-2xl font-semibold">Part by part</h3>
            <ul className="mt-4 divide-y border-y">
              {review.sections.map((section, i) => (
                <li key={i} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-4">
                  <p className="min-w-0 font-medium break-words">{section.label}</p>
                  <p className="text-sm text-muted-foreground tabular-nums">
                    {section.coverage}% said
                    {section.wpm !== null && ` · ${section.wpm} words/min, ${describePace(section.wpm, pace).label.toLowerCase()}`}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {review.skipped.length > 0 && (
          <div>
            <h3 className="text-2xl font-semibold">Skipped</h3>
            <p className="mt-1 text-sm text-muted-foreground">In your script, but we didn&apos;t hear it. Small gaps can be transcription slips.</p>
            <ul className="mt-4 space-y-2">
              {review.skipped.map((part, i) => (
                <li key={i} className="border-l-2 border-destructive/50 pl-4 text-lg break-words">&ldquo;{part}&rdquo;</li>
              ))}
            </ul>
          </div>
        )}

        {review.added.length > 0 && (
          <div>
            <h3 className="text-2xl font-semibold">Added</h3>
            <p className="mt-1 text-sm text-muted-foreground">You said it, but it isn&apos;t in your script.</p>
            <ul className="mt-4 space-y-2">
              {review.added.map((part, i) => (
                <li key={i} className="border-l-2 border-brand pl-4 text-lg break-words">&ldquo;{part}&rdquo;</li>
              ))}
            </ul>
          </div>
        )}

        {review.tips.length > 0 && (
          <div>
            <h3 className="text-2xl font-semibold">Tips for your script</h3>
            <ol className="mt-4 divide-y border-y">
              {review.tips.map((tip, i) => (
                <li key={i} className="grid grid-cols-[auto_1fr] gap-x-5 py-4">
                  <span aria-hidden="true" className="text-3xl leading-[0.9] font-black text-(--brand) tabular-nums">{i + 1}</span>
                  <p className="text-lg">{tip}</p>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
