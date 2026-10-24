// Shows the three numbers we measured for one recording as cards, each with a
// rating badge ("Good pace", "Some fillers"...) from Rian's lib/metrics/describe.ts.
// Display only: the math and the ratings happen in lib/metrics, this just lays it out.
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { describeFillers, describePace, describePauses, type Rating } from "@/lib/metrics/describe";
import type { SpeechMetrics } from "@/lib/metrics/types";

// Green / amber / red. Amber (not our brand orange) for "okay", so a warning
// never looks like a normal button or highlight.
const TONE_COLORS: Record<Rating["tone"], string> = {
  good: "border-green-600/30 bg-green-600/10 text-green-700",
  okay: "border-amber-500/40 bg-amber-400/15 text-amber-800",
  bad: "border-red-600/30 bg-red-600/10 text-red-700",
};

type MetricCardProps = {
  label: string;
  value: number;
  unit: string;
  hint: string;
  rating: Rating;
};

// One card. Kept separate so all three cards are guaranteed to look the same.
function MetricCard({ label, value, unit, hint, rating }: MetricCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        {/* flex-wrap lets the unit drop below the number when the card is narrow */}
        <CardTitle className="flex flex-wrap items-baseline gap-x-1 text-4xl font-semibold tabular-nums">
          {value}
          <span className="text-base font-normal whitespace-nowrap text-muted-foreground">{unit}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Badge variant="outline" className={TONE_COLORS[rating.tone]}>{rating.label}</Badge>
        <p className="text-sm text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

// durationMs (the recording's length) lets the filler and pause ratings work per minute.
export default function MetricsCards({ metrics, durationMs }: { metrics: SpeechMetrics; durationMs: number }) {
  return (
    // One column on phones, three side by side on wider screens.
    <div className="grid gap-4 sm:grid-cols-3">
      <MetricCard
        label="Pace"
        value={metrics.wordsPerMinute}
        unit="words/min"
        hint="How fast you spoke on average."
        rating={describePace(metrics.wordsPerMinute)}
      />
      <MetricCard
        label="Filler words"
        value={metrics.fillerCount}
        unit={metrics.fillerCount === 1 ? "filler" : "fillers"}
        hint="Sounds like “um”, “uh” and “hmm”."
        rating={describeFillers(metrics.fillerCount, durationMs)}
      />
      <MetricCard
        label="Long pauses"
        value={metrics.pauses.length}
        unit={metrics.pauses.length === 1 ? "pause" : "pauses"}
        hint="Silences over 1 second."
        rating={describePauses(metrics.pauses.length, durationMs)}
      />
    </div>
  );
}
