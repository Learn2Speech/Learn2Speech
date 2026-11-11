"use client"; // runs a clock and rotates the tips
// What the Upload and Record pages show while a recording is being saved and analyzed, so the wait feels
// short: moving sound bars, which of the two stages we're on, a clock counting up, and a tip that
// changes every few seconds. The stage is real (it comes from the upload code); the bars are
// decoration. The bar animation is the "wave" rule in globals.css.
import { useEffect, useState } from "react";
import { Check } from "lucide-react";

const STAGES = [
  { title: "Saving your recording", text: "It goes into your private storage. Only you can open it." },
  { title: "Listening to it", text: "Timing every word, counting fillers and pauses, then writing your coaching. This can take a few minutes." },
];

// Things worth knowing while you wait. The numbers match lib/metrics/describe.ts.
const TIPS = [
  "A comfortable speaking pace is 120 to 160 words per minute.",
  "A silence only counts as a long pause once it passes one second.",
  "Try a short breath instead of an “um” before a new idea.",
  "Shorter recordings come back faster.",
  "Your results are saved to History, so you can leave and come back.",
];

// bar heights in % of the box; fixed (not random) so the server and browser draw the same thing
const BARS = [30, 55, 80, 45, 95, 60, 35, 70, 100, 50, 75, 40, 90, 55, 30, 65, 85, 45, 70, 35, 60, 95, 50, 25];

// stage: 0 = saving the file, 1 = analyzing it
export default function Waiting({ stage, fileName }: { stage: 0 | 1; fileName: string }) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const tip = TIPS[Math.floor(seconds / 6) % TIPS.length];
  const clock = `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`;

  return (
    // role="status": screen readers announce the stage when it changes
    <div role="status">
      <div aria-hidden="true" className="flex h-40 items-center gap-[1.5%] sm:h-56">
        {BARS.map((height, i) => (
          <span
            key={i}
            className="wave-bar flex-1 rounded-full bg-(--brand)"
            style={{ height: `${height}%`, animationDelay: `${i * -110}ms` }}
          />
        ))}
      </div>

      <p className="mt-6 flex items-baseline justify-between gap-4 border-t border-foreground pt-3 text-sm">
        <span className="min-w-0 truncate font-medium">{fileName}</span>
        <span className="text-muted-foreground tabular-nums">{clock}</span>
      </p>

      <ol className="mt-6 space-y-5">
        {STAGES.map((item, i) => (
          <li key={item.title} className={`grid grid-cols-[2rem_1fr] gap-x-3 ${i > stage ? "opacity-40" : ""}`}>
            <span aria-hidden="true" className="text-2xl leading-none font-black text-(--brand) tabular-nums">
              {i < stage ? <Check className="size-6" strokeWidth={3} /> : i + 1}
            </span>
            <div>
              <p className="text-xl leading-none font-semibold">
                {item.title}
                {i < stage && <span className="sr-only"> (done)</span>}
              </p>
              {i === stage && <p className="mt-2 text-muted-foreground">{item.text}</p>}
            </div>
          </li>
        ))}
      </ol>

      {/* key={tip} restarts the little rise-in animation each time the tip changes.
          aria-hidden: the tips are extra, and reading a new one every 6 seconds would be noise. */}
      <p key={tip} aria-hidden="true" className="rise-in mt-8 border-t pt-4 text-lg [animation-delay:0ms]">
        <span className="text-muted-foreground">While you wait: </span>
        {tip}
      </p>
    </div>
  );
}
