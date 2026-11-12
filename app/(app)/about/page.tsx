// /about: what Learn2Speech is, who made it, and a link to our Congressional App Challenge video.
// A plain link instead of an embedded player, so YouTube loads nothing (and sets no cookies) until someone clicks.
import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Play } from "lucide-react";
import PageHeader from "@/components/page-header";

export const metadata: Metadata = { title: "About | Learn2Speech" };

const VIDEO_URL = "https://www.youtube.com/watch?v=4IKF0R3xr6Y";

// same section shape as the Privacy Policy page: a heading, then a paragraph and/or bullet points
const SECTIONS: { heading: string; body?: string; points?: string[] }[] = [
  {
    heading: "Who we are",
    body: "Learn2Speech was made by Rian Desai and Akshith Magesh for the 2026 Congressional App Challenge in Virginia's 2nd District.",
  },
  {
    heading: "What the video covers",
    body: "In our 3-minute submission video, we explain the problem Learn2Speech solves, who it's for and how it's built, then demo it live. We sign up, record a short test speech on a phone, upload it, and walk through the results: the metrics, the coaching feedback and the transcript. We finish on the History page, which lists every past recording and only ever shows your own. The app has been redesigned since we filmed it, so it looks a little different now, but it works the same way.",
  },
  {
    heading: "The problem, by the numbers",
    points: [
      "77% of people have some fear of public speaking, making it the number one phobia in the world (Crown Counseling).",
      "Only 8% of them ever get professional help, because of cost and access: private speech coaching costs hundreds of dollars.",
      "Most speaking anxiety comes from not being prepared, and that's the part anyone can fix with practice.",
    ],
  },
  {
    heading: "Who it's for",
    points: [
      "High schoolers and adults heading into jobs and programs. Many academies and companies in our district rely on strong public speaking.",
      "People learning English. About 59,000 people in our district, 7.52%, were born outside the country.",
      "People with speech impediments.",
      "For all of them, Learn2Speech is a judgment-free place to practice anytime. But it's useful for anyone.",
    ],
  },
  {
    heading: "How it works",
    body: "The app is built with Next.js and TypeScript and runs on Vercel. Supabase handles logins and stores each recording privately, with database rules so you only ever see your own data. AssemblyAI turns your speech into text with a timestamp for every word. Our own code uses those timestamps to measure your pace, filler words and pauses, and Claude, by Anthropic, turns those numbers into coaching feedback.",
  },
  {
    heading: "The data you get back",
    points: [
      "A transcript of everything you said, with your filler words highlighted.",
      "Your speaking pace in words per minute, compared with a comfortable 120 to 160.",
      "How many filler words you used (um, uh, ah, hmm, err, eh) and how often per minute.",
      "Every pause longer than a second, shown on a timeline of your speech.",
      "Coaching feedback: what you did well, plus the 3 to 5 biggest things to fix, each with a tip you can actually try.",
      "A progress chart across all your recordings, and a \"since last time\" comparison with your previous run.",
    ],
  },
  {
    heading: "What happens to your recordings",
    points: [
      "Your recordings and results are stored privately in your account. Only you can see them.",
      "To make your feedback, the audio is sent to AssemblyAI to turn it into text, and the transcript to Anthropic for the coaching.",
      "You can delete any recording at any time, which removes the audio, transcript, numbers and feedback.",
    ],
  },
];

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-10">
      <PageHeader title="About Learn2Speech" description="A speech coach that listens to your practice runs and tells you what to fix." />

      <a
        href={VIDEO_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="group mb-10 flex items-center gap-4 rounded-lg border border-foreground p-4 transition-colors hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-brand text-white">
          <Play aria-hidden="true" className="size-6 translate-x-0.5 fill-current" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold">Watch our Congressional App Challenge video</span>
          <span className="block text-sm text-muted-foreground">Learn2Speech, Congressional App Challenge 2026 (VA-02), on YouTube</span>
        </span>
        <ExternalLink aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" />
        <span className="sr-only">(opens in a new tab)</span>
      </a>

      <div className="space-y-6">
        {SECTIONS.map((section) => (
          <section key={section.heading} className="space-y-2">
            <h2 className="text-lg font-semibold">{section.heading}</h2>
            {section.body && <p className="leading-relaxed text-muted-foreground">{section.body}</p>}
            {section.points && (
              <ul className="list-disc space-y-1.5 pl-5 leading-relaxed text-muted-foreground marker:text-brand">
                {section.points.map((point) => <li key={point}>{point}</li>)}
              </ul>
            )}
          </section>
        ))}
        <p className="text-sm text-muted-foreground">
          Want to try it without an account? Open the <Link href="/demo" className="font-medium text-foreground underline underline-offset-4">Tutorial</Link>.
          {" "}More detail in our <Link href="/privacy" className="font-medium text-foreground underline underline-offset-4">Privacy Policy</Link>.
          {" "}Questions: <a href="mailto:learn2speechteam@gmail.com" className="font-medium text-foreground underline underline-offset-4">learn2speechteam@gmail.com</a>
        </p>
      </div>
    </main>
  );
}
