// Home page. The eye-catcher first, then the example speech playing back (what the app does),
// then the three steps, one at a time with an example each (each slides in as you scroll to it), then common questions and the privacy promise.
// Anyone can see it; Upload and History need an account.
import Link from "next/link";
import { Plus } from "lucide-react";
import Waveform from "@/components/brand/waveform";
import Hero from "@/components/home/hero";
import LiveDemo from "@/components/home/live-demo";
import { sampleFeedback, sampleMetrics, sampleTranscript } from "@/components/home/sample-result";
import Reveal from "@/components/reveal";
import { buttonVariants } from "@/components/ui/button";

// Each step comes with a small example of what it looks like, so nobody has to imagine it.
const STEPS = [
  {
    title: "Record a run-through",
    text: "Use your phone or laptop's voice recorder. Even 30 seconds shows your habits.",
    example: (
      <div className="flex items-center gap-4">
        <span className="size-3 shrink-0 rounded-full bg-(--brand)" />
        <span className="font-medium tabular-nums">0:18</span>
        <Waveform className="h-16 flex-1 items-center" barClassName="rounded-full bg-(--brand)" />
      </div>
    ),
  },
  {
    title: "Upload the file",
    text: "mp3, wav or m4a, up to 50 MB. It's stored privately in your account.",
    example: (
      <div>
        <p className="flex justify-between gap-4 font-medium">
          <span>practice-run.m4a</span>
          <span className="text-muted-foreground">Uploaded</span>
        </p>
        <div className="mt-3 h-1.5 rounded-full bg-(--brand)" />
      </div>
    ),
  },
  {
    title: "Fix the top three things",
    text: "Read your numbers, see where fillers and pauses landed, and work through the coach's suggestions.",
    example: (
      <dl className="space-y-4">
        {sampleFeedback.improvements.map((item) => (
          <div key={item.area}>
            <dt className="font-semibold">{item.area}</dt>
            <dd className="text-muted-foreground">{item.tip}</dd>
          </div>
        ))}
      </dl>
    ),
  },
];

// Questions a new visitor is likely to have. Every answer is something the app really does.
const FAQ = [
  { q: "What kind of file can I upload?", a: "An mp3, wav or m4a recording, up to 50 MB. A voice memo from your phone works." },
  { q: "Who can see my recordings?", a: "Only you. Each recording, transcript and piece of feedback is locked to your account, and you can delete any of them." },
  { q: "How long does it take?", a: "Usually a few minutes. Shorter recordings come back faster, and the result is saved to your History either way." },
  { q: "Where does the feedback come from?", a: "Our own code measures your pace, filler words and pauses from the timed transcript. An AI model (Claude) then reads those numbers and your words and writes the coaching." },
  { q: "Do I need an account to look around?", a: "No. The tutorial walks through a sample result with no account. You need a free account to upload your own recording." },
];

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />

      {/* the teal block (the 30): the example speech playing back on its timeline */}
      <section className="on-teal bg-teal">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <h2 className="text-4xl font-semibold sm:text-5xl">What you get back</h2>
          <p className="mt-3 mb-10 text-muted-foreground">Example: an 18-second practice run about sleep, played back.</p>
          <LiveDemo metrics={sampleMetrics} durationMs={sampleTranscript.durationMs} words={sampleTranscript.words} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
        <h2 className="text-4xl font-semibold sm:text-5xl">How it works</h2>
        {/* a real sequence, so numbered. Each step slides in on its own as you scroll to it. */}
        <ol className="mt-10">
          {STEPS.map((step, i) => (
            <li key={step.title} className="border-t border-foreground py-10 sm:py-14">
              <Reveal className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-16">
                <div className="grid grid-cols-[auto_1fr] items-start gap-x-6">
                  <span aria-hidden="true" className="text-8xl leading-[0.8] font-black text-(--brand) tabular-nums">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-2xl font-semibold sm:text-3xl">{step.title}</h3>
                    <p className="mt-2 max-w-[40ch] text-lg text-muted-foreground">{step.text}</p>
                  </div>
                </div>
                <figure>
                  <figcaption className="mb-3 text-sm text-muted-foreground">Example</figcaption>
                  <div className="rounded-lg border p-5 sm:p-6">{step.example}</div>
                </figure>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      {/* questions and answers; <details> is the browser's built-in open/close, so it needs no script */}
      <section className="mx-auto grid max-w-7xl gap-8 px-6 pb-20 sm:pb-28 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <h2 className="text-4xl font-semibold sm:text-5xl">Questions</h2>
        <div className="divide-y border-y border-foreground">
          {FAQ.map((item) => (
            <details key={item.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-xl font-semibold [&::-webkit-details-marker]:hidden">
                {item.q}
                <Plus aria-hidden="true" className="size-6 shrink-0 text-primary transition-transform duration-200 ease-out group-open:rotate-45" />
              </summary>
              <p className="mt-3 max-w-[60ch] text-lg text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-20 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <h2 className="text-4xl font-semibold sm:text-5xl">Your recordings stay yours.</h2>
            <p className="mt-3 text-muted-foreground">
              Every recording, transcript and piece of feedback is locked to your account at the database level,
              so not even someone who guesses a link can see it.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/signup" className={buttonVariants({ size: "lg", className: "h-12 px-6" })}>
              Create a free account
            </Link>
            <Link href="/demo" className={buttonVariants({ size: "lg", variant: "outline", className: "h-12 border-foreground/30! px-6" })}>
              Try the tutorial
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
