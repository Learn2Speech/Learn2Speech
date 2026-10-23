// Home page: the first thing visitors (and judges) see. Explains what the app does
// and how to use it. Anyone can see it; Upload and History need an account.
import Link from "next/link";
import { Gauge, LockKeyhole, MessageSquareQuote, Mic, Sparkles, Timer, Upload, Waves } from "lucide-react";
import Hero from "@/components/home/hero";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const STEPS = [
  { icon: Mic, title: "Record", text: "Record yourself giving a speech or presentation on your phone or computer." },
  { icon: Upload, title: "Upload", text: "Upload the audio file (mp3, wav or m4a). Only you can see your recordings." },
  { icon: Sparkles, title: "Get feedback", text: "We turn your speech into text, measure how you spoke, and coach you on what to improve." },
];

const MEASURES = [
  { icon: Gauge, title: "Pace", text: "Your words per minute, so you know if you're rushing or dragging." },
  { icon: MessageSquareQuote, title: "Filler words", text: "Every “um”, “uh” and “like”, and when you said it." },
  { icon: Timer, title: "Pauses", text: "Long silences that can make a speech lose its flow." },
  { icon: Waves, title: "Coaching tips", text: "What you did well and the most important things to work on next." },
];

// Small heading used above each section, so all sections line up the same way.
function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-8 space-y-2">
      <p className="text-sm font-medium text-primary">{eyebrow}</p>
      <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
    </div>
  );
}

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />

      <section className="mx-auto max-w-6xl px-6 py-16">
        <SectionHeading eyebrow="How it works" title="Three steps to better speeches" />
        <ol className="grid gap-4 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title}>
              <Card className="h-full">
                <CardHeader>
                  <div className="mb-2 flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
                      <step.icon className="size-5" />
                    </span>
                    <span className="text-sm font-medium text-muted-foreground">Step {i + 1}</span>
                  </div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                  <CardDescription className="text-sm">{step.text}</CardDescription>
                </CardHeader>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y bg-muted/40">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <SectionHeading eyebrow="What we measure" title="Feedback you can actually act on" />
          <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
            {MEASURES.map((item) => (
              <div key={item.title} className="flex gap-4">
                <item.icon className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <Card className="items-center bg-primary text-center text-primary-foreground ring-0 [--card-spacing:--spacing(10)]">
          <CardContent className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight">Ready to practice?</h2>
            <p className="flex items-center justify-center gap-2 text-sm text-primary-foreground/85">
              <LockKeyhole className="size-4" /> Your recordings and feedback are private to your account.
            </p>
            <Link href="/upload" className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "h-11 px-6 text-base")}>
              Upload your first speech
            </Link>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
