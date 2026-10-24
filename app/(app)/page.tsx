// Home page: the first thing visitors (and judges) see. Says who the app is for,
// shows a real example result, and explains the three steps. Anyone can see it;
// Upload and History need an account.
import Link from "next/link";
import Hero from "@/components/home/hero";
import { buttonVariants } from "@/components/ui/button";

const USES = ["Class presentations", "Debate and speech competitions", "Job and college interviews", "Toasts and speeches"];

const STEPS = [
  { title: "Record a run-through", text: "Use your phone or laptop's voice recorder. Even 30 seconds is enough to see your habits." },
  { title: "Upload the file", text: "mp3, wav or m4a. It's stored privately in your account; nobody else can open it." },
  { title: "Fix the top three things", text: "Read your numbers, see where fillers and pauses landed on the timeline, and work through the coach's three suggestions." },
];

export default function Home() {
  return (
    <main className="flex-1 pb-20">
      <Hero />

      <section className="mx-auto max-w-5xl px-6 pt-16">
        <p className="text-sm font-medium text-muted-foreground">Made for practice runs before</p>
        {/* a plain list instead of a row of icon cards; the small square echoes the timeline's marks */}
        <ul className="mt-3 flex flex-wrap gap-x-8 gap-y-2 font-heading text-lg sm:text-xl">
          {USES.map((use) => (
            <li key={use} className="flex items-center gap-2.5">
              <span aria-hidden="true" className="size-2 rounded-[2px] bg-primary" />
              {use}
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-5xl px-6 pt-16">
        <h2 className="text-2xl font-bold sm:text-3xl">How it works</h2>
        <ol className="mt-8 grid gap-10 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="border-t-2 border-foreground pt-4">
              <span className="font-heading text-4xl font-bold text-primary">{i + 1}</span>
              <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
              <p className="mt-1 text-muted-foreground">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto mt-16 flex max-w-5xl flex-col gap-6 px-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl">
          <h2 className="text-2xl font-bold sm:text-3xl">Your recordings stay yours.</h2>
          <p className="mt-2 text-muted-foreground">
            Every recording, transcript and piece of feedback is locked to your account at the database level,
            so not even someone who guesses a link can see it.
          </p>
        </div>
        <Link href="/signup" className={buttonVariants({ size: "lg", className: "h-11 px-5 text-base" })}>
          Create a free account
        </Link>
      </section>
    </main>
  );
}
