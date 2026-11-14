// Live filler counter: counts filler words in a piece of live text, using the SAME filler list as the
// full analysis (lib/metrics/fillers.ts), so the live number and the results page mean the same thing.
import { FILLER_WORDS } from "@/lib/metrics/fillers";

export type FillerCounts = Record<string, number>; // e.g. { um: 3, uh: 1 }

export function countFillers(text: string): FillerCounts {
  const counts: FillerCounts = {};
  for (const raw of text.toLowerCase().split(/\s+/)) {
    const word = raw.replace(/[^a-z']/g, "");
    if (FILLER_WORDS.includes(word)) counts[word] = (counts[word] ?? 0) + 1;
  }
  return counts;
}

export function addCounts(a: FillerCounts, b: FillerCounts): FillerCounts {
  const sum: FillerCounts = { ...a };
  for (const [word, n] of Object.entries(b)) sum[word] = (sum[word] ?? 0) + n;
  return sum;
}

export function totalOf(counts: FillerCounts): number {
  return Object.values(counts).reduce((total, n) => total + n, 0);
}
