// Decorative row of rounded bars, echoing the sound bars in our logo.
// Used on the login/sign-up pages and the home page so they share one look.
import { cn } from "@/lib/utils";

// Bar heights in % of the box. A fixed list, not Math.random(), so the server
// and the browser draw the exact same picture.
const WAVE = [18, 30, 46, 62, 40, 24, 36, 58, 80, 64, 42, 28, 50, 72, 92, 70, 48, 34, 56, 78, 60, 38, 26, 44, 66, 52, 32, 20, 38, 54, 30, 16];

export default function Waveform({ className, barClassName }: { className?: string; barClassName?: string }) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none flex items-end justify-center gap-[1.5%]", className)}>
      {WAVE.map((height, i) => (
        <span key={i} className={cn("w-[1.6%] max-w-4 rounded-t-full bg-primary/15", barClassName)} style={{ height: `${height}%` }} />
      ))}
    </div>
  );
}
