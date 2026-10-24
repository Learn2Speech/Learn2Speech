// The top of the home page: what the app does in one line, two buttons, and an
// example results card so visitors can see what they'll get before signing up.
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import Waveform from "@/components/brand/waveform";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Made-up numbers, clearly labeled "Example" on the card, just to show the layout.
const EXAMPLE_STATS = [
  { label: "Pace", value: "148", unit: "wpm" },
  { label: "Fillers", value: "4", unit: "" },
  { label: "Pauses", value: "2", unit: "" },
];

function ExampleResultCard() {
  return (
    <Card className="w-full max-w-sm rotate-1 shadow-xl [--card-spacing:--spacing(5)]">
      <CardHeader>
        <CardDescription>Example result</CardDescription>
        <CardTitle className="text-lg">My history class presentation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          {EXAMPLE_STATS.map((stat) => (
            <div key={stat.label} className="rounded-lg bg-muted px-3 py-2">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-xl font-semibold tabular-nums">
                {stat.value}
                <span className="ml-0.5 text-xs font-normal text-muted-foreground">{stat.unit}</span>
              </p>
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-primary/20 bg-accent p-3 text-sm text-accent-foreground">
          <p className="mb-1 flex items-center gap-1.5 font-medium">
            <Sparkles className="size-4" /> Coaching tip
          </p>
          Try pausing for a breath instead of saying &ldquo;um&rdquo; when you switch to a new point.
        </div>
      </CardContent>
    </Card>
  );
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b bg-gradient-to-b from-accent/60 to-background">
      <Waveform className="absolute inset-x-0 bottom-0 h-40 opacity-50" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 md:py-24 lg:grid-cols-2">
        <div className="space-y-6">
          <Badge variant="outline" className="border-primary/30 bg-background text-primary">
            Your personal speech coach
          </Badge>
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Speak with <span className="text-primary">confidence</span>.
          </h1>
          <p className="max-w-lg text-lg text-muted-foreground">
            Upload a recording of your speech and get clear feedback on your pace, filler words and pauses,
            plus coaching tips on what to practice next.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/upload" className={cn(buttonVariants({ size: "lg" }), "h-11 px-5 text-base")}>
              Upload a speech <ArrowRight />
            </Link>
            <Link href="/history" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 px-5 text-base")}>
              View my history
            </Link>
          </div>
        </div>
        <div className="flex justify-center lg:justify-end">
          <ExampleResultCard />
        </div>
      </div>
    </section>
  );
}
