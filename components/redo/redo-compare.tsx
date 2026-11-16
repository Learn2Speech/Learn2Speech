// Redo a speech, results page: this take next to the earlier take it redid, so the speaker sees what changed.
// Shown at the top of /history/<id> when the recording is a redo (feedback.redoOf). Display only; the rows
// are worked out from numbers both takes already have. "Better" is decided per row:
//   pace: closer to the target range · fillers and long pauses: fewer per minute · script: more of it said ·
//   on topic: a higher rating. Length is shown but not judged.
import Link from "next/link";
import type { CoachingFeedback, ImpromptuRating } from "@/lib/feedback/types";
import type { SpeechMetrics } from "@/lib/metrics/types";
import { DEFAULT_PACE, speechTypeInfo, type PaceRange } from "@/lib/topic/speech-types";
import { formatClock } from "@/lib/impromptu/topics";
import { cn } from "@/lib/utils";

export type Take = { metrics: SpeechMetrics; durationMs: number; feedback: CoachingFeedback };

type Row = {
  label: string;
  before: number;
  after: number;
  show: (n: number) => string;
  better: "lower" | "higher" | null; // null = not judged
  headline?: (before: string, after: string) => string; // the sentence used if this row is the big improvement
};

const perMinute = (count: number, durationMs: number) => (durationMs ? count / (durationMs / 60000) : 0);
const oneDecimal = (n: number) => (Math.round(n * 10) / 10).toString();
// how far a pace is outside the target range (0 = inside it)
const offPace = (wpm: number, pace: PaceRange) => (wpm < pace.low ? pace.low - wpm : wpm > pace.high ? wpm - pace.high : 0);
const RATING_SCORE: Record<ImpromptuRating, number> = { weak: 0, okay: 1, strong: 2 };
const RATING_WORD = ["Needs work", "Okay", "Strong"];

function buildRows(earlier: Take, current: Take, pace: PaceRange): Row[] {
  const rows: Row[] = [
    {
      label: "Fillers per minute",
      before: perMinute(earlier.metrics.fillerCount, earlier.durationMs),
      after: perMinute(current.metrics.fillerCount, current.durationMs),
      show: oneDecimal, better: "lower",
      headline: (b, a) => `Fewer fillers: ${b} → ${a} per minute.`,
    },
    // pace 0 = too short to measure (lib/metrics/wpm.ts), so there's nothing to compare
    ...(earlier.metrics.wordsPerMinute && current.metrics.wordsPerMinute ? [{
      label: `Pace (target ${pace.low} to ${pace.high})`,
      before: earlier.metrics.wordsPerMinute,
      after: current.metrics.wordsPerMinute,
      show: (n: number) => `${n} wpm`, better: null,
      headline: (b: string, a: string) => `Pace closer to your target: ${b} → ${a}.`,
    }] : []),
    {
      label: "Long pauses per minute",
      before: perMinute(earlier.metrics.pauses.length, earlier.durationMs),
      after: perMinute(current.metrics.pauses.length, current.durationMs),
      show: oneDecimal, better: "lower",
      headline: (b, a) => `Fewer long pauses: ${b} → ${a} per minute.`,
    },
  ];
  if (earlier.feedback.script && current.feedback.script) {
    rows.push({
      label: "Script said",
      before: earlier.feedback.script.coverage, after: current.feedback.script.coverage,
      show: (n) => `${n}%`, better: "higher",
      headline: (b, a) => `More of your script: ${b} → ${a}.`,
    });
  }
  const onTopicBefore = earlier.feedback.topic?.onTopic?.rating ?? earlier.feedback.impromptu?.onTopic.rating;
  const onTopicAfter = current.feedback.topic?.onTopic?.rating ?? current.feedback.impromptu?.onTopic.rating;
  if (onTopicBefore && onTopicAfter) {
    rows.push({
      label: "Stayed on topic",
      before: RATING_SCORE[onTopicBefore], after: RATING_SCORE[onTopicAfter],
      show: (n) => RATING_WORD[n], better: "higher",
    });
  }
  rows.push({ label: "Length", before: earlier.durationMs / 1000, after: current.durationMs / 1000, show: formatClock, better: null });
  return rows;
}

// +1 better, -1 worse, 0 same or not judged
function direction(row: Row, pace: PaceRange): number {
  if (row.label.startsWith("Pace")) return Math.sign(offPace(row.before, pace) - offPace(row.after, pace));
  if (!row.better || row.show(row.before) === row.show(row.after)) return 0;
  return (row.after < row.before) === (row.better === "lower") ? 1 : -1;
}

const CHANGE = {
  1: { text: "Better", className: "text-green-700 dark:text-green-400" },
  [-1]: { text: "Worse", className: "text-destructive" },
  0: { text: "Same", className: "text-muted-foreground" },
} as const;

export default function RedoCompare({ earlier, earlierId, earlierName, current }: {
  earlier: Take;
  earlierId: string;
  earlierName: string;
  current: Take;
}) {
  // judge pace against this take's topic target if it has one, otherwise the usual range
  const pace = current.feedback.topic ? speechTypeInfo(current.feedback.topic.speechType).pace : DEFAULT_PACE;
  const rows = buildRows(earlier, current, pace);
  const improved = rows.find((row) => row.headline && direction(row, pace) === 1);
  const better = rows.filter((row) => direction(row, pace) === 1).length;
  return (
    <section aria-labelledby="redo-compare-title" className="mb-16 grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
      <div>
        <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">Your redo</p>
        <h2 id="redo-compare-title" className="mt-2 text-3xl leading-[1.1] font-semibold sm:text-4xl">
          {improved ? improved.headline!(improved.show(improved.before), improved.show(improved.after)) : "Your two takes, side by side."}
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          {better === 0 ? "Nothing moved the right way this time. Look at the rows to see what to try next." : `Better on ${better} of ${rows.length - 1} measures.` /* Length isn't judged */}{" "}
          Compared with <Link href={`/history/${earlierId}`} className="font-medium text-foreground underline underline-offset-4">{earlierName}</Link>.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left tabular-nums">
          <thead>
            <tr className="border-b border-foreground text-sm text-muted-foreground">
              <th scope="col" className="py-3 pr-4 font-medium">Measure</th>
              <th scope="col" className="py-3 pr-4 font-medium">Earlier take</th>
              <th scope="col" className="py-3 pr-4 font-medium">This take</th>
              <th scope="col" className="py-3 font-medium">Change</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((row) => {
              const change = CHANGE[direction(row, pace) as 1 | -1 | 0];
              return (
                <tr key={row.label}>
                  <th scope="row" className="py-4 pr-4 font-medium">{row.label}</th>
                  <td className="py-4 pr-4 text-muted-foreground">{row.show(row.before)}</td>
                  <td className="py-4 pr-4 text-lg font-semibold">{row.show(row.after)}</td>
                  <td className={cn("py-4 font-medium", row.label === "Length" ? "text-muted-foreground" : change.className)}>
                    {row.label === "Length" ? "—" : change.text}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
