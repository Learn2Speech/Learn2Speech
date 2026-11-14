// Topic mode: the free, instant first check on a typed topic. Runs in the browser (so an obvious keysmash
// is turned down before anything is uploaded) AND again in the analyze route (so a changed browser can't skip it).
// It only catches things that are clearly not words: "asdfgh", "jjjjjj", "lololol", "dfkjghdfkjg".
// Anything subtler ("idk", "test", an instruction to the AI) is left to the Claude check in classify-topic.ts.

export const MAX_TOPIC_LENGTH = 120;

// Trims the topic and drops characters that could look like prompt markup (<topic>, {json}, ```).
// The result is what gets saved and what the feedback prompt sees.
export function cleanTopic(raw: string): string {
  return raw.replace(/[<>{}[\]`\\]/g, "").replace(/\s+/g, " ").trim().slice(0, MAX_TOPIC_LENGTH);
}

const KEY_ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
// 4-letter keyboard runs that are also inside real words ("liberty", "property")
const REAL_RUNS = new Set(["erty"]);

// true if the word has 4 letters in a row that sit next to each other on a keyboard ("asdf", "lkjh")
function hasKeyboardRun(word: string): boolean {
  for (let i = 0; i + 4 <= word.length; i++) {
    const run = word.slice(i, i + 4);
    if (REAL_RUNS.has(run)) continue;
    const reversed = [...run].reverse().join("");
    if (KEY_ROWS.some((row) => row.includes(run) || row.includes(reversed))) return true;
  }
  return false;
}

// A word that looks mashed rather than typed on purpose
function looksMashed(original: string): boolean {
  const word = original.toLowerCase();
  if (word.length < 3) return false;
  const isAcronym = original.length <= 6 && original === original.toUpperCase(); // NASA, HTML, STEM
  if (!isAcronym && word.length >= 4 && !/[aeiouy]/.test(word)) return true; // "sdfg", "hjkl"
  if (/[^aeiouy]{6,}/.test(word)) return true; // six consonants in a row ("strengths" has only five)
  if (/(.)\1\1/.test(word)) return true; // the same letter three times ("aaa", "jjjj")
  if (word.length >= 6 && /^(.{1,3})\1{2,}/.test(word)) return true; // "lololol", "asdasdasd"
  return hasKeyboardRun(word);
}

// Whole topics that are clearly not a subject. Caught here for free instead of spending a Claude check on them.
const NOT_A_TOPIC = new Set(["idk", "i dont know", "i don't know", "test", "testing", "lol", "lmao", "hmm", "hmmm", "none", "nothing", "stuff", "things", "whatever", "random", "topic", "speech", "my speech", "no", "yes", "na", "n a", "asdf"]);

// null if the topic passes, otherwise a message to show the speaker
export function quickTopicProblem(topic: string): string | null {
  const cleaned = cleanTopic(topic);
  const plain = cleaned.toLowerCase().replace(/[^\p{L}\s']/gu, " ").replace(/\s+/g, " ").trim();
  if (NOT_A_TOPIC.has(plain)) return "That doesn't say what your speech is about, so we can't tune your feedback to it.";
  const letters = cleaned.match(/\p{L}/gu) ?? [];
  if (letters.length < 3) return "That topic is too short to tune your feedback to. Add a few words about what your speech covers.";
  // Words made of letters only (numbers and punctuation don't count either way)
  const words = cleaned.match(/\p{L}+/gu) ?? [];
  const realLength = words.filter((w) => w.length >= 3);
  if (realLength.length === 0) return "That topic is too short to tune your feedback to. Add a few words about what your speech covers.";
  // The letter checks below only make sense for the English alphabet; other scripts go to the Claude check
  const latin = realLength.filter((w) => /^[a-z]+$/i.test(w));
  const mashed = latin.filter(looksMashed).length;
  const vowels = latin.join("").match(/[aeiouy]/gi)?.length ?? 0;
  const latinLetters = latin.join("").length;
  if ((latin.length > 0 && mashed / latin.length > 0.5) || (latinLetters >= 8 && vowels / latinLetters < 0.15)) {
    return "That topic looks like random letters, so we can't tune your feedback to it.";
  }
  return null;
}
