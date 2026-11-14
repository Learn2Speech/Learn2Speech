// Script mode: compares the script the speaker pasted with what they actually said (the transcript).
// Pure code, no AI, so the numbers are the same every time and cost nothing.
//
// How: both texts become lists of plain lowercase words, then we find the longest run of words they share
// in the same order (the "longest common subsequence", the same idea a diff tool uses). Script words that
// were matched were said; script words left over were skipped; spoken words left over were added.
// The matched words carry their timestamps, so we can also measure the pace of each part of the script.
import type { TranscriptWord } from "@/lib/transcription/types";
import { FILLER_WORDS } from "@/lib/metrics/fillers";
import { MAX_SCRIPT_LENGTH, type ScriptComparison, type ScriptSection } from "@/lib/script/types";

const MIN_RUN = 4; // a skipped or added part must be at least this many words in a row to be listed
const MAX_LISTED = 8; // list at most this many skipped and added parts
const MAX_SPOKEN = 2500; // cap on spoken words compared (keeps the comparison table a few MB at most)

// Tidies pasted text: no control characters, normal spaces, paragraphs kept, capped length
export function cleanScript(raw: string): string {
  const visible = [...raw.replace(/\r\n?/g, "\n")]
    .filter((c) => c === "\n" || c === "\t" || (c.charCodeAt(0) >= 32 && c.charCodeAt(0) !== 127)) // drop control characters
    .join("");
  return visible
    .replace(/[^\S\n]+/g, " ") // runs of spaces and tabs (not newlines) become one space
    .replace(/ ?\n ?/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, MAX_SCRIPT_LENGTH);
}

export function countWords(text: string): number {
  return text.split(/\s+/).filter((w) => normalize(w)).length;
}

function normalize(word: string): string {
  return word.toLowerCase().replace(/[’']/g, "").replace(/[^\p{L}\p{N}]/gu, "");
}

function shorten(text: string, max = 120): string {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

// The script split into parts: its paragraphs, or, for one long block, groups of sentences of ~40+ words
function splitSections(script: string): string[] {
  const paragraphs = script.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  if (paragraphs.length > 1) return paragraphs;
  const sentences = script.match(/[^.!?]+[.!?]*/g)?.map((s) => s.trim()).filter(Boolean) ?? [script];
  const groups: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    current = current ? `${current} ${sentence}` : sentence;
    if (countWords(current) >= 40) {
      groups.push(current);
      current = "";
    }
  }
  if (current) {
    // a short leftover joins the group before it
    if (groups.length > 0 && countWords(current) < 20) groups[groups.length - 1] += ` ${current}`;
    else groups.push(current);
  }
  return groups;
}

// Lists runs of 4+ unmatched words, as the original text
function unmatchedRuns(words: string[], matched: boolean[]): string[] {
  const runs: string[] = [];
  let run: string[] = [];
  const flush = () => {
    if (run.length >= MIN_RUN && runs.length < MAX_LISTED) runs.push(shorten(run.join(" ")));
    run = [];
  };
  words.forEach((word, i) => {
    if (matched[i]) flush();
    else run.push(word);
  });
  flush();
  return runs;
}

export function compareScript(script: string, transcriptWords: TranscriptWord[]): ScriptComparison {
  // script words, each remembering which part of the script it belongs to
  const sections = splitSections(script);
  const scriptWords: { text: string; norm: string; section: number }[] = [];
  sections.forEach((section, s) => {
    for (const text of section.split(/\s+/)) {
      const norm = normalize(text);
      if (norm) scriptWords.push({ text, norm, section: s });
    }
  });
  // spoken words, without fillers (a script never says "um")
  const spoken = transcriptWords
    .map((w) => ({ text: w.text, norm: normalize(w.text), start: w.start, end: w.end }))
    .filter((w) => w.norm && !FILLER_WORDS.includes(w.norm))
    .slice(0, MAX_SPOKEN);

  const n = scriptWords.length;
  const m = spoken.length;
  // table[i][j] = longest shared run between script words i.. and spoken words j.. (filled from the end)
  const width = m + 1;
  const table = new Uint16Array((n + 1) * width);
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      table[i * width + j] = scriptWords[i].norm === spoken[j].norm
        ? table[(i + 1) * width + j + 1] + 1
        : Math.max(table[(i + 1) * width + j], table[i * width + j + 1]);
    }
  }
  // walk the table to pair each matched script word with the spoken word it matched
  const scriptMatched = new Array<boolean>(n).fill(false);
  const spokenMatched = new Array<boolean>(m).fill(false);
  const pairs: { script: number; spoken: number }[] = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (scriptWords[i].norm === spoken[j].norm) {
      scriptMatched[i] = spokenMatched[j] = true;
      pairs.push({ script: i, spoken: j });
      i++; j++;
    } else if (table[(i + 1) * width + j] >= table[i * width + j + 1]) {
      i++;
    } else {
      j++;
    }
  }

  const percent = (part: number, whole: number) => (whole ? Math.round((part / whole) * 100) : 0);
  const sectionResults: ScriptSection[] = sections.map((section, s) => {
    const indexes = scriptWords.flatMap((w, k) => (w.section === s ? [k] : []));
    const said = pairs.filter((p) => scriptWords[p.script].section === s);
    let wpm: number | null = null;
    if (said.length >= 8) {
      const minutes = (spoken[said[said.length - 1].spoken].end - spoken[said[0].spoken].start) / 60000;
      // only measure parts that took at least 5 seconds, or the number jumps around
      if (minutes >= 5 / 60) wpm = Math.round(said.length / minutes);
    }
    const label = section.split(/\s+/).slice(0, 6).join(" ");
    return {
      label: section.split(/\s+/).length > 6 ? `${label}…` : label,
      words: indexes.length,
      coverage: percent(said.length, indexes.length),
      wpm,
    };
  });

  return {
    coverage: percent(pairs.length, n),
    scriptWords: n,
    skipped: unmatchedRuns(scriptWords.map((w) => w.text), scriptMatched),
    added: unmatchedRuns(spoken.map((w) => w.text), spokenMatched),
    sections: sectionResults,
  };
}
