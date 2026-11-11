"use client"; // keeps track of which step you're on
// The interactive tutorial's guide: a bar at the bottom of /demo that walks through a results
// page one part at a time. Next/Back scroll to that part and outline it in orange (the outline
// is the [data-tour-active] rule in globals.css). The parts are found by the data-tour names set
// in components/results/results-view.tsx. It only reads the page: no network, no account.
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";

const STEPS = [
  { target: "headline", title: "The headline", text: "First you see the filler word you said most, in giant type, next to the coach's short summary." },
  { target: "metrics", title: "Your three numbers", text: "Pace, filler words and long pauses. The orange tick is where you landed; the teal stretch is the range to aim for." },
  { target: "timeline", title: "Where it happened", text: "The whole recording from left to right. Orange bars are filler words, and gaps are silence." },
  { target: "feedback", title: "Your coaching", text: "What went well, then what to work on, with the most important fix first." },
  { target: "transcript", title: "Your words", text: "Everything you said, with each filler word and long pause marked where it happened." },
];

export default function Tour() {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const last = step === STEPS.length - 1;

  useEffect(() => {
    const part = document.querySelector(`[data-tour="${STEPS[step].target}"]`);
    if (!part) return;
    part.setAttribute("data-tour-active", "");
    // don't yank the page on arrival; only scroll once the visitor starts stepping
    if (step > 0 || window.scrollY > 0) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      part.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
    }
    return () => part.removeAttribute("data-tour-active");
  }, [step]);

  return (
    <aside
      aria-label="Tutorial"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-foreground bg-background pb-[env(safe-area-inset-bottom)]"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:gap-8">
        {/* aria-live: screen readers read the new step when it changes */}
        <div aria-live="polite" className="min-w-0 flex-1">
          <p className="text-sm text-muted-foreground tabular-nums">
            Step {step + 1} of {STEPS.length}
          </p>
          <p className="text-lg font-semibold">{current.title}</p>
          <p className="text-muted-foreground">{current.text}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="lg" disabled={step === 0} onClick={() => setStep(step - 1)}>
            Back
          </Button>
          {last ? (
            // prefetch={false}: Upload needs a login, see the note in components/site-nav.tsx
            <Link href="/upload" prefetch={false} className={buttonVariants({ size: "lg" })}>
              Upload your own
            </Link>
          ) : (
            <Button size="lg" onClick={() => setStep(step + 1)}>
              Next
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
}
