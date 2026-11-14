// Script mode: the shapes of a script comparison. The comparison is worked out in code
// (compare-script.ts), Claude only adds a comment and tips, and the results page shows it all.

export const MAX_SCRIPT_LENGTH = 6000; // characters: about 10 minutes of speech

// One part of the script (a paragraph, or a group of sentences when the script is one long block)
export type ScriptSection = {
  label: string; // its first few words, so the speaker can find it
  words: number; // how many words the part has
  coverage: number; // percent of its words that were said, 0-100
  wpm: number | null; // pace while saying this part; null when too little of it was said to measure
};

export type ScriptComparison = {
  coverage: number; // percent of the script's words that were said, 0-100
  scriptWords: number;
  skipped: string[]; // parts of the script that weren't said (4+ words in a row)
  added: string[]; // things said that aren't in the script (4+ words in a row)
  sections: ScriptSection[];
};

// What gets saved in feedback.script
export type ScriptReview = ScriptComparison & {
  text: string; // the script itself, so "Redo this speech" can bring it back
  comment?: string; // Claude: how closely they followed it and whether the changes helped
  tips: string[]; // Claude: 1-3 tips for delivering this script (empty if the reply had none)
};
