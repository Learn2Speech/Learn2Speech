// Shows Claude's coaching feedback for one recording: the overall summary,
// what went well, and the most important things to work on (best first).
// Display only: the prompt and parsing live in lib/feedback.
import { CheckCircle2, Sparkles, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CoachingFeedback } from "@/lib/feedback/types";

export default function FeedbackPanel({ feedback }: { feedback: CoachingFeedback }) {
  return (
    <div className="space-y-4">
      {/* summary first, in the brand tint, since it's the one-line answer to "how did I do?" */}
      <div className="rounded-xl border border-primary/20 bg-accent p-5 text-accent-foreground">
        <p className="mb-1 flex items-center gap-2 text-sm font-medium">
          <Sparkles className="size-4" /> Coach&apos;s summary
        </p>
        <p className="text-base leading-relaxed">{feedback.summary}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="size-5 text-green-600" /> What went well
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {feedback.strengths.map((strength, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-green-600" />
                  {strength}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="size-5 text-primary" /> What to work on
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* numbered because Claude puts the most important improvement first */}
            <ol className="space-y-3 text-sm">
              {feedback.improvements.map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-medium">{item.area}</p>
                    <p className="text-muted-foreground">{item.tip}</p>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
