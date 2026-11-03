// Our logo: the teal speech bubble with sound bars, plus the "Learn2Speech" wordmark.
// Drawn as SVG (shapes, not a picture file) so it stays sharp at any size.
import { cn } from "@/lib/utils";

// --brand is set in globals.css, so the logo follows the color palette
const BRAND_COLOR = "var(--brand)";

// Just the bubble. Used alone where space is tight (e.g. a collapsed sidebar).
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 440 360" className={className} aria-hidden="true">
      <rect width="440" height="300" rx="80" fill={BRAND_COLOR} />
      {/* the little tail at the bottom-left that makes it a speech bubble */}
      <path d="M180 299 L180 360 L240 299 Z" fill={BRAND_COLOR} />
      <g fill="white">
        <rect x="140" y="110" width="24" height="60" rx="12" />
        <rect x="184" y="80" width="24" height="120" rx="12" />
        <rect x="228" y="50" width="24" height="180" rx="12" />
        <rect x="272" y="90" width="24" height="100" rx="12" />
        <rect x="316" y="120" width="24" height="40" rx="12" />
      </g>
    </svg>
  );
}

// Bubble + name. The text is real text (not part of the SVG) so screen readers say the name.
export default function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-2xl tracking-tight", className)}>
      <LogoMark className="h-[1.3em] w-auto" />
      <span>
        Learn<span style={{ color: BRAND_COLOR }}>2</span>Speech
      </span>
    </span>
  );
}
