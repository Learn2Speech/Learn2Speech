// /demo: the interactive tutorial. It shows a real results page filled with a made-up example
// (components/home/sample-result.ts) and a guide bar that walks through it step by step.
// Safe to leave public: it uses no account, no database, no API keys and makes no requests.
// Everything on it is fixed sample text that ships with the page.
import type { Metadata } from "next";
import { sampleFeedback, sampleMetrics, sampleTranscript } from "@/components/home/sample-result";
import ResultsView from "@/components/results/results-view";
import Tour from "@/components/tour";

export const metadata: Metadata = { title: "Tutorial | Learn2Speech" };

export default function DemoPage() {
  return (
    // pb-56 leaves room for the guide bar fixed to the bottom of the screen
    <main className="mx-auto w-full max-w-7xl px-6 pt-12 pb-56">
      <h1 className="text-4xl font-semibold sm:text-5xl">Tutorial: reading your results</h1>
      <p className="mt-3 mb-12 max-w-[60ch] text-lg text-muted-foreground">
        This is a made-up example: an 18-second practice run about sleep. Nothing is uploaded and you don&apos;t need
        an account. Use Next at the bottom to walk through it.
      </p>
      <ResultsView metrics={sampleMetrics} feedback={sampleFeedback} transcript={sampleTranscript} />
      <Tour />
    </main>
  );
}
