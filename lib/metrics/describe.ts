export type Rating = { label: string; tone: "good" | "okay" | "bad"};

export function describePace(wpm: number): Rating {
  if (wpm < 100) return { label: "Too slow", tone: "bad" };
  if (wpm < 120) return { label: "A bit slow", tone: "okay" };
  if (wpm <= 160) return { label: "Good pace", tone: "good" };
  if (wpm <= 180) return { label: "A bit fast", tone: "okay" };
  return { label: "Too fast", tone: "bad" };
}
export function describeFillers(fillers: number, durationMs: number): Rating {
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