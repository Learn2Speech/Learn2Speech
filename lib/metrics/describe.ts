// SUMMARY: turns raw numbers into plain-English ratings ("Good pace", "Lots of fillers")
// that the results cards show as colored badges. "tone" picks the badge color.
// The cutoffs are rules of thumb for public speaking, not exact science.
export type Rating = { label: string; tone: "good" | "okay" | "bad"};

// Pace has TWO bad sides (too slow and too fast), so it checks both ends of the range.
// 120-160 words per minute is a comfortable speaking speed.
export function describePace(wpm: number): Rating {
  if (wpm < 100) return { label: "Too slow", tone: "bad" };
  if (wpm < 120) return { label: "A bit slow", tone: "okay" };
  if (wpm <= 160) return { label: "Good pace", tone: "good" };
  if (wpm <= 180) return { label: "A bit fast", tone: "okay" };
  return { label: "Too fast", tone: "bad" };
}
// Fillers and pauses only have one bad side (more is worse), and they are rated PER MINUTE
// so a long speech isn't punished just for having more total fillers than a short one.
export function describeFillers(fillers: number, durationMs: number): Rating {
  // dividing by zero minutes would give Infinity, so a missing duration gets a neutral rating instead
  if (!durationMs) return { label: "Too short to rate", tone: "okay" };
  const minutes = durationMs/60000;
  const fpm = fillers/minutes;
  if (fpm <= 2) return { label: "Few fillers", tone: "good" };
  if (fpm <= 5) return { label: "Some fillers", tone: "okay" };
  return { label: "Lots of fillers", tone: "bad" };
}
export function describePauses(pauses: number, durationMs: number): Rating {
  if (!durationMs) return { label: "Too short to rate", tone: "okay" };
  const minutes = durationMs/60000;
  const ppm = pauses/minutes;
  if (ppm <= 4) return { label: "Steady flow", tone: "good" };
  if (ppm <= 8) return { label: "Some long pauses", tone: "okay" };
  return { label: "Frequent long pauses", tone: "bad" };
}