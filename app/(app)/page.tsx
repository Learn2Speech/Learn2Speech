// Home page: the first thing visitors see. Says who the app is for, shows a real example
// result, and explains the steps. Anyone can see it; Upload and History need an account.
import Link from "next/link";
import Hero from "@/components/home/hero";
import { buttonVariants } from "@/components/ui/button";

const STEPS = [
  { title: "Record a run-through", text: "Use your phone or laptop's voice recorder. Even 30 seconds is enough to show your habits." },
  { title: "Upload the file", text: "mp3, wav or m4a. It's stored privately in your account; nobody else can open it." },
  { title: "Fix the top three things", text: "Read your numbers, see where fillers and pauses landed, and work through the coach's three suggestions." },
];

export default function Home() {
  return (
    <main className="flex-1 pb-24">
      <Hero />

      <section className="mx-auto mt-24 grid max-w-5xl gap-8 px-6 md:grid-cols-[1fr_2fr] md:gap-16">
        <h2 className="text-2xl sm:text-3xl">How it works</h2>
        {/* a real sequence, so the steps are numbered; a plain list, not three boxes */}
        <ol className="divide-y border-y">
          {STEPS.map((step, i) => (
            <li key={step.title} className="grid grid-cols-[2rem_1fr] gap-x-4 py-5">
              <span className="pt-0.5 text-sm tabular-nums text-muted-foreground">{i + 1}</span>
              <div>
                <h3 className="text-lg">{step.title}</h3>
                <p className="mt-1 text-muted-foreground">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto mt-24 flex max-w-5xl flex-col gap-6 px-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl">
          <h2 className="text-2xl sm:text-3xl">Your recordings stay yours.</h2>
          <p className="mt-2 text-muted-foreground">
            Every recording, transcript and piece of feedback is locked to your account at the database level,
            so not even someone who guesses a link can see it.
          </p>
        </div>
        <Link href="/signup" className={buttonVariants({ size: "lg" })}>
          Create a free account
        </Link>
      </section>
    </main>
  );
}
