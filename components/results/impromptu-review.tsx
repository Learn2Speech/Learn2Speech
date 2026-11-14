// Impromptu runs only: the topic you were given and the three extra checks from the feedback
// (stayed on topic, structure, use of time). Display only: the prompt and parsing live in lib/feedback.
import { Check, X } from "lucide-react";
import type { ImpromptuCheck, ImpromptuRating, ImpromptuReview as Review } from "@/lib/feedback/types";
import { formatClock } from "@/lib/impromptu/topics";
import { cn } from "@/lib/utils";

const RATING_LABEL: Record<ImpromptuRating, string> = { strong: "Strong", okay: "Okay", weak: "Needs work" };
const RATING_COLOR: Record<ImpromptuRating, string> = {
  strong: "border-green-600/30 bg-green-600/10 text-green-700 dark:text-green-400",
  okay: "border-brand/30 bg-accent text-accent-foreground",
  weak: "border-destructive/30 bg-destructive/10 text-destructive",
};

function Rating({ rating }: { rating: ImpromptuRating }) {
  return (
    <span className={cn("inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-sm font-medium", RATING_COLOR[rating])}>
      {RATING_LABEL[rating]}
    </span>
  );
}

// opening / points / closing, ticked or crossed
function Part({ label, ok }: { label: string; ok: boolean }) {
  return (
    <li className="flex items-center gap-1.5 text-sm">
      {ok ? <Check className="size-4 text-green-700 dark:text-green-400" aria-hidden="true" /> : <X className="size-4 text-destructive" aria-hidden="true" />}
      <span>{label}</span>
      <span className="sr-only">{ok ? "(present)" : "(missing)"}</span>
    </li>
  );
}

function Row({ title, detail, check, children }: { title: string; detail?: string; check: ImpromptuCheck; children?: React.ReactNode }) {
  return (
    <li className="py-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-lg font-semibold">
          {title}
          {detail && <span className="ml-2 font-normal text-muted-foreground tabular-nums">{detail}</span>}
        </p>
        <Rating rating={check.rating} />
      </div>
      {children}
      <p className="mt-2 max-w-[75ch] text-muted-foreground">{check.comment}</p>
    </li>
  );
}

export default function ImpromptuReview({ topic, targetSeconds, durationMs, review }: {
  topic: string;
  targetSeconds: number;
  durationMs: number;
  review?: Review;
}) {
  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
      <div>
        <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">Impromptu topic</p>
        <h2 className="mt-2 text-3xl leading-[1.1] font-semibold sm:text-4xl">{topic}</h2>
      </div>
      {review ? (
        <ul className="divide-y border-y">
          <Row title="Stayed on topic" check={review.onTopic} />
          <Row title="Structure" check={review.structure}>
            <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
              <Part label="Opening" ok={review.structure.opening} />
              <Part label={`${review.structure.mainPoints} main ${review.structure.mainPoints === 1 ? "point" : "points"}`} ok={review.structure.mainPoints > 0} />
              <Part label="Closing" ok={review.structure.closing} />
            </ul>
          </Row>
          <Row title="Use of time" detail={`${formatClock(durationMs / 1000)} of ${formatClock(targetSeconds)}`} check={review.timeUse} />
        </ul>
      ) : (
        // the feedback came back without the impromptu section (rare): still show the timing we know
        <p className="border-y py-5 text-muted-foreground">
          You spoke for {formatClock(durationMs / 1000)} of {formatClock(targetSeconds)}. The topic and structure check wasn&apos;t available for this run.
        </p>
      )}
    </div>
  );
}
