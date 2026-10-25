// Privacy policy. Plain text only, so it stays a Server Component (no "use client").
// Like /terms it lives in (app) for the sidebar layout, and anyone can read it without logging in.
// Keep it honest: every line should match what the app really does. If the code changes
// (new data, new service, new way to delete), update this page and the date below.
import Link from "next/link";
import PageHeader from "@/components/page-header";

type Section = { heading: string; body?: string; points?: string[] };

const SECTIONS: Section[] = [
  {
    heading: "The short version",
    points: [
      "We collect what the app needs to coach you: your email, your recordings, and the results we make from them.",
      "Only you can see your recordings and results. The database itself enforces this, and you can delete any recording at any time.",
      "We don't sell your data, show ads, or use tracking or analytics tools.",
      "Your audio is sent to AssemblyAI for transcription, and the transcript to Anthropic (Claude) for feedback. Nobody else gets it.",
    ],
  },
  {
    heading: "What we collect",
    points: [
      "Account: your email address and password. Your password is stored scrambled (hashed) by our login provider, Supabase; we never see it.",
      "Recordings: the audio files you upload, their original file names and sizes, and when you uploaded them.",
      "Results: the transcript of each recording (every word with its timing), your pace, filler word and pause measurements, and the coaching feedback.",
      "Small browser settings: a login cookie so you stay signed in, and your light/dark mode and sidebar preferences. We don't use advertising or tracking cookies.",
    ],
  },
  {
    heading: "How we use it",
    body: "Only to run Learn2Speech: to log you in, store your recordings, analyze them, and show you your results and history. We don't use your recordings or results for anything else, and we don't sell or rent your information to anyone.",
  },
  {
    heading: "Services that handle your data",
    points: [
      "Supabase stores your account, recordings and results. Recordings are kept in a private storage area, and each person can only reach their own files and results.",
      "AssemblyAI turns your audio into text. We give it a temporary link to your recording that stops working after 10 minutes, and as soon as the transcript is done we ask AssemblyAI to delete its copy of the audio and text.",
      "Anthropic (Claude) writes your coaching feedback from your transcript and speaking stats. Anthropic handles this data under its commercial terms, which say it doesn't train its models on data sent through its API by default.",
      "Vercel hosts the website. Like any web host, it keeps short-term technical logs (for example, when a page was requested) so the site can run and errors can be fixed.",
    ],
  },
  {
    heading: "How we protect it",
    points: [
      "Everything is sent over encrypted connections (HTTPS).",
      "Row Level Security rules in our database only return a recording or result to the account that owns it, so even someone who guesses a link can't open your data.",
      "Uploaded files get random names, and the secret keys for our AI services are only used on our server, never in your browser.",
      "Our pages tell browsers not to let other sites embed them, and they block the camera, microphone and location, which the app never uses.",
      "No system is perfectly secure, but we keep the data we hold to what the app needs.",
    ],
  },
  {
    heading: "Recording other people",
    body: "Please only upload recordings of your own voice, or of people who have agreed to be recorded and analyzed.",
  },
  {
    heading: "How long we keep it, and deleting it",
    body: "We keep your recordings and results until you delete them. You can delete any recording yourself with the Delete recording button on its results page: this permanently removes the audio file, transcript, measurements and feedback from our storage and database. To delete your whole account, contact the Learn2Speech team and we'll remove it and everything in it.",
  },
  {
    heading: "Age",
    body: "You must be 13 or older to use Learn2Speech. If we learn that someone under 13 has created an account, we will delete it and its data.",
  },
  {
    heading: "Changes and contact",
    // TODO(team): add a contact email here and on /terms
    body: "If we change what we collect or who we share it with, we'll update this page and the date at the top. Questions or deletion requests: contact the Learn2Speech team.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-10">
      <PageHeader title="Privacy Policy" description="Last updated October 25, 2026" />
      <div className="space-y-6">
        {SECTIONS.map((section) => (
          <section key={section.heading} className="space-y-2">
            <h2 className="text-lg font-semibold">{section.heading}</h2>
            {section.body && <p className="leading-relaxed text-muted-foreground">{section.body}</p>}
            {section.points && (
              <ul className="list-disc space-y-1.5 pl-5 leading-relaxed text-muted-foreground marker:text-primary">
                {section.points.map((point) => <li key={point}>{point}</li>)}
              </ul>
            )}
          </section>
        ))}
        <p className="text-sm text-muted-foreground">
          See also our <Link href="/terms" className="font-medium text-foreground underline underline-offset-4">Terms and Conditions</Link>.
        </p>
      </div>
    </main>
  );
}
