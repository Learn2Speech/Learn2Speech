// Home page. Leads with the product's own output, then how it works, then privacy.
// Anyone can see it; Upload and History need an account.
import Link from "next/link";
import Hero from "@/components/home/hero";
import { buttonVariants } from "@/components/ui/button";

const STEPS = [
  { title: "Record a run-through", text: "Use your phone or laptop's voice recorder. Even 30 seconds shows your habits." },
  { title: "Upload the file", text: "mp3, wav or m4a. It's stored privately in your account." },
  { title: "Fix the top three things", text: "Read your numbers, see where fillers and pauses landed, and work through the coach's suggestions." },
];

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />

      <section className="mx-auto mt-28 grid max-w-6xl gap-8 px-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <h2 className="text-2xl sm:text-3xl">How it works</h2>
        {/* a real sequence, so numbered; a plain list, not boxes */}
        <ol className="divide-y border-y">
          {STEPS.map((step, i) => (
            <li key={step.title} className="grid grid-cols-[2.5rem_1fr] gap-x-4 py-5">
              <span className="pt-1 font-mono text-sm tabular-nums text-muted-foreground">{i + 1}</span>
              <div>
                <h3 className="text-lg">{step.title}</h3>
                <p className="mt-1 text-muted-foreground">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto my-28 flex max-w-6xl flex-col gap-6 px-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl">
          <h2 className="text-2xl sm:text-3xl">Your recordings stay yours.</h2>
          <p className="mt-3 text-muted-foreground">
            Every recording, transcript and piece of feedback is locked to your account at the database level,
            so not even someone who guesses a link can see it.
          </p>
        </div>
        <Link href="/signup" className={buttonVariants({ size: "lg", variant: "outline" })}>
          Create a free account
        </Link>
      </section>
    </main>
  );
}
