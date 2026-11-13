// Accessibility statement: what standard we aim for, what we do to meet it, and how to report a problem.
// Same shape as /privacy. Keep it honest: only claim what the app really does, and update the date when you
// re-check the app (see the Accessibility section of the /home-screen skill for how to test).
import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/page-header";

export const metadata: Metadata = { title: "Accessibility" };

type Section = { heading: string; body?: string; points?: string[] };

const SECTIONS: Section[] = [
  {
    heading: "Our goal",
    body: "We want everyone to be able to practice with Learn2Speech, including people who use a keyboard, a screen reader, zoom, or reduced motion. We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.2 at Level AA.",
  },
  {
    heading: "What we do",
    points: [
      "Everything can be used with a keyboard, with a visible outline on whatever is selected, and a \"Skip to content\" link at the top of each page.",
      "Text is checked for contrast in both light and dark mode.",
      "Every form field has a label, and errors are announced to screen readers and say how to fix them.",
      "If your device is set to reduce motion, the page animations are turned off.",
      "Button sounds are short and quiet, and the speaker button in the top bar turns them off. Nothing depends on hearing them.",
      "Pages work on phones and when zoomed in, without scrolling sideways.",
    ],
  },
  {
    heading: "Things we know about",
    points: [
      "Our Congressional App Challenge video is hosted on YouTube. If you need a written transcript of it, email us and we'll send one.",
      "Recording needs a browser that supports microphone recording. If yours doesn't, you can upload an audio file instead.",
    ],
  },
  {
    heading: "How we check",
    body: "We test pages with automated accessibility checks (Lighthouse) and by using the app with only a keyboard. Automated tools don't catch everything, so please tell us about anything that gets in your way.",
  },
  {
    heading: "Report a problem",
    body: "If something on Learn2Speech is hard or impossible for you to use, email learn2speechteam@gmail.com. Tell us the page, what you were trying to do, and the device or assistive technology you use. We'll reply and work on a fix.",
  },
];

export default function AccessibilityPage() {
  return (
    <main className="mx-auto w-full max-w-[70ch] px-6 py-10">
      <PageHeader title="Accessibility" description="Last reviewed November 12, 2026" />
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
          Contact: <a href="mailto:learn2speechteam@gmail.com" className="font-medium text-foreground underline underline-offset-4">learn2speechteam@gmail.com</a>
          {" · "}See also our <Link href="/privacy" className="font-medium text-foreground underline underline-offset-4">Privacy Policy</Link>.
        </p>
      </div>
    </main>
  );
}
