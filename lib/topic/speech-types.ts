// Topic mode: the kinds of speech a typed topic can be, and what "good" looks like for each.
// When a speaker adds a topic, Claude picks ONE of these ids when it checks the topic (lib/topic/classify-topic.ts).
// The pace targets live here in code, not in the AI, so the gauge on the results page and the feedback prompt
// always agree. Rules of thumb from speech coaching: slower for stories, poems and toasts, faster for debate.

export type PaceRange = { low: number; high: number };

type SpeechTypeInfo = {
  label: string; // shown on results, e.g. "Persuasive speech"
  pace: PaceRange; // good words-per-minute range for this kind of speech
  focus: string; // what matters most for this kind of speech; told to Claude so its topic tips aim at it
  hint: string; // one-line description Claude reads when picking the type
};

export const SPEECH_TYPES = {
  general: {
    label: "General speech",
    pace: { low: 120, high: 160 },
    focus: "a clear main idea, an easy-to-follow order and steady delivery",
    hint: "anything that doesn't clearly fit another type",
  },
  persuasive: {
    label: "Persuasive speech",
    pace: { low: 130, high: 160 },
    focus: "a clear position, convincing reasons and evidence, answering the other side, and a strong call to action",
    hint: "arguing for or against something, a should/shouldn't question, convincing the audience",
  },
  informative: {
    label: "Informative talk",
    pace: { low: 120, high: 150 },
    focus: "explaining ideas clearly, defining key terms, a logical order and concrete examples or facts",
    hint: "explaining a topic, a report, a history, how something works, science or current events",
  },
  storytelling: {
    label: "Story or personal speech",
    pace: { low: 110, high: 150 },
    focus: "a hooking opening, vivid details, pausing for effect and a clear takeaway or lesson",
    hint: "a personal experience, a memory, a narrative, 'a time when...', about yourself",
  },
  ceremonial: {
    label: "Toast or ceremony speech",
    pace: { low: 110, high: 140 },
    focus: "warmth, a short personal story, pausing for the audience's reaction and a short, memorable close",
    hint: "a toast, wedding or birthday speech, eulogy, graduation, award or thank-you speech",
  },
  presentation: {
    label: "Presentation or pitch",
    pace: { low: 130, high: 160 },
    focus: "a hook, a clear problem and solution, signposting each section and a specific ask at the end",
    hint: "a class or work presentation, a business or startup pitch, a project or product demo",
  },
  debate: {
    label: "Debate speech",
    pace: { low: 140, high: 180 },
    focus: "clear claims with reasons and impacts, direct rebuttal of the other side and a roadmap of your points",
    hint: "a debate round, a Model UN position, a resolution, a rebuttal",
  },
  dramatic: {
    label: "Poem or dramatic reading",
    pace: { low: 100, high: 130 },
    focus: "expression, varying pace and volume to match the mood, and meaningful pauses",
    hint: "reciting a poem, a monologue, a scene, spoken word, a dramatic reading",
  },
  instructional: {
    label: "How-to or lesson",
    pace: { low: 110, high: 140 },
    focus: "clear steps in order, repeating key points and checking the audience can follow",
    hint: "teaching how to do something, a tutorial, a recipe, a lesson or instructions",
  },
} as const satisfies Record<string, SpeechTypeInfo>;

export type SpeechType = keyof typeof SPEECH_TYPES;

// The comfortable range used when there is no topic (matches lib/metrics/describe.ts)
export const DEFAULT_PACE: PaceRange = { low: 120, high: 160 };

export function isSpeechType(value: unknown): value is SpeechType {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(SPEECH_TYPES, value);
}

// Safe lookup for a value read back from the database: anything unknown counts as a general speech
export function speechTypeInfo(value: unknown): SpeechTypeInfo {
  return SPEECH_TYPES[isSpeechType(value) ? value : "general"];
}

// What the analyze route passes to the feedback step for a run with a topic
export type TopicInfo = { topic: string; speechType: SpeechType };
