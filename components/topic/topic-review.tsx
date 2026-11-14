// Runs with a typed topic only: the topic, what kind of speech it was judged as (and so the pace target),
// whether the speech stayed on it, and the tips that only make sense for this topic.
// Display only: the prompt and parsing live in lib/feedback, the speech types in lib/topic.
import { Rating } from "@/components/results/impromptu-review";
import type { TopicReview as Review } from "@/lib/feedback/types";
import { speechTypeInfo } from "@/lib/topic/speech-types";

export default function TopicReview({ review }: { review: Review }) {
  const type = speechTypeInfo(review.speechType);
  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
      <div>
        <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">Your topic</p>
        <h2 className="mt-2 text-3xl leading-[1.1] font-semibold break-words sm:text-4xl">{review.topic}</h2>
        <p className="mt-4 max-w-[45ch] text-lg text-muted-foreground">
          Judged as a {type.label.toLowerCase()}, so your pace target is {type.pace.low} to {type.pace.high} words per minute.
        </p>
      </div>
      <div>
        {review.onTopic && (
          <div className="border-t py-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-lg font-semibold">Stayed on topic</p>
              <Rating rating={review.onTopic.rating} />
            </div>
            <p className="mt-2 max-w-[75ch] text-muted-foreground">{review.onTopic.comment}</p>
          </div>
        )}
        <h3 className="border-t pt-5 text-2xl font-semibold">Tips for your topic</h3>
        {review.tips.length > 0 ? (
          <ol className="mt-4 divide-y border-y">
            {review.tips.map((tip, i) => (
              <li key={i} className="grid grid-cols-[auto_1fr] gap-x-5 py-4">
                <span aria-hidden="true" className="text-3xl leading-[0.9] font-black text-(--brand) tabular-nums">{i + 1}</span>
                <p className="text-lg">{tip}</p>
              </li>
            ))}
          </ol>
        ) : (
          // the feedback came back without the topic section (rare): the pace target above still applies
          <p className="mt-4 border-y py-5 text-muted-foreground">Topic tips weren&apos;t available for this run.</p>
        )}
      </div>
    </div>
  );
}
