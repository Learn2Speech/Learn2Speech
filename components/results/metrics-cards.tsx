// Shows the three numbers we measured for one recording as cards.
// Display only: the math happens in lib/metrics, this just lays it out.
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { SpeechMetrics } from "@/lib/metrics/types";

type MetricCardProps = {
  label: string;
  value: number;
  unit: string;
  hint: string;
};

// One card. Kept separate so all three cards are guaranteed to look the same.
function MetricCard({ label, value, unit, hint }: MetricCardProps) {
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
      <CardContent className="text-sm text-muted-foreground">{hint}</CardContent>
    </Card>
  );
}

export default function MetricsCards({ metrics }: { metrics: SpeechMetrics }) {
  return (
    // One column on phones, three side by side on wider screens.
    <div className="grid gap-4 sm:grid-cols-3">
      <MetricCard
        label="Pace"
        value={metrics.wordsPerMinute}
        unit="words/min"
        hint="How fast you spoke on average."
      />
      <MetricCard
        label="Filler words"
        value={metrics.fillerCount}
        unit={metrics.fillerCount === 1 ? "filler" : "fillers"}
        hint="Sounds like “um”, “uh” and “hmm”."
      />
      <MetricCard
        label="Long pauses"
        value={metrics.pauses.length}
        unit={metrics.pauses.length === 1 ? "pause" : "pauses"}
        hint="Silences long enough to notice."
      />
    </div>
  );
}
