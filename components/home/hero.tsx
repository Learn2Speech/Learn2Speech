// Top of the home page, laid out like a type specimen: one giant filler word (the eye-catcher),
// a short headline saying what was measured, one button, and a pace slider over the example speech.
// Colors follow 50/30/20: the page is the neutral 50, the giant word is teal (30), and orange (20)
// is only on things you can press or drag.
import Link from "next/link";
import PaceSpecimen from "@/components/home/pace-specimen";
import { sampleMetrics, sampleTranscript } from "@/components/home/sample-result";
import { buttonVariants } from "@/components/ui/button";

export default function Hero() {
  const seconds = Math.round(sampleTranscript.durationMs / 1000);
  return (
    <section className="mx-auto w-full max-w-7xl px-6 pt-10 pb-16 sm:pt-14">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] lg:items-center lg:gap-12">
        {/* decoration: the headline next to it says the same thing in words */}
        <p
          aria-hidden="true"
          className="um-in -ml-[0.04em] text-[55vw] leading-[0.62] font-black tracking-[-0.04em] text-(--brand) select-none lg:text-[clamp(11rem,36vw,31rem)]"
        >
          um
        </p>
        <div className="rise-in">
          <h1 className="text-4xl leading-[1.02] font-semibold sm:text-5xl">
            {sampleMetrics.fillerCount} filler words in {seconds} seconds.
          </h1>
          <p className="mt-4 max-w-[38ch] text-lg text-muted-foreground">
            That&apos;s an example. Upload a practice run and Learn2Speech finds every um, uh and long pause in yours,
            and measures your pace.
          </p>
          {/* prefetch={false}: these pages need a login, see the note in components/site-nav.tsx */}
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/upload" prefetch={false} className={buttonVariants({ size: "lg", className: "h-12 px-6" })}>
              Upload a practice run
            </Link>
            {/* the tutorial needs no account: it walks through a sample result */}
            <Link href="/demo" className={buttonVariants({ size: "lg", variant: "outline", className: "h-12 border-foreground/30! px-6" })}>
              Try the tutorial
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-10 sm:mt-14">
        <PaceSpecimen metrics={sampleMetrics} words={sampleTranscript.words} />
      </div>
    </section>
  );
}
