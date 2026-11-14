// Impromptu mode: the built-in topic list and the speech lengths you can pick.
// Plain data, no AI, so picking a topic costs nothing. Used by the Record page (to show a topic),
// the analyze route (only topics from THIS list are trusted into the feedback prompt), and History.
// Keep every topic under 200 characters: migration 0008 limits the topic column to that.

export const TOPICS = [
  "Should homework be banned?",
  "Should school start later in the morning?",
  "Is social media doing more harm than good for teenagers?",
  "Should phones be allowed in class?",
  "Should every student learn a second language?",
  "Is it better to be a leader or a team player?",
  "Should school uniforms be required?",
  "What is one invention the world could live without?",
  "Should video games count as a sport?",
  "Is it ever okay to tell a white lie?",
  "Should students grade their teachers?",
  "What makes someone a good friend?",
  "Should the voting age be lowered to 16?",
  "Is failure necessary for success?",
  "Should everyone have to do community service?",
  "Are grades the best way to measure learning?",
  "Should junk food be sold in schools?",
  "What is the most important skill school doesn't teach?",
  "Should zoos exist?",
  "Is it better to save money or spend it on experiences?",
  "Should college be free?",
  "Would you rather live in the city or the countryside?",
  "Should artificial intelligence be allowed to write homework?",
  "Is it more important to be smart or to be kind?",
  "Should the school week be four days long?",
  "What is the best way to deal with stress?",
  "Should athletes be paid as much as they are?",
  "Is reading books still important in the internet age?",
  "Should kids have a curfew?",
  "What would you change about your town?",
  "Should plastic bags be banned everywhere?",
  "Is space exploration worth the money?",
  "Should students be allowed to choose all their classes?",
  "What makes a good teacher?",
  "Should every high schooler have a part-time job?",
  "Is it better to specialize in one thing or try many things?",
  "Should cars be banned from city centers?",
  "What is the best advice you have ever received?",
  "Should there be a limit on screen time for kids?",
  "Is competition good for students?",
  "Should people be allowed to bring pets to work or school?",
  "What is a skill everyone should learn before turning 18?",
  "Should standardized tests be removed from college admissions?",
  "Is it better to work alone or in a group?",
  "Should music and art be required subjects?",
  "Would the world be better without money?",
  "Should we be allowed to clone animals?",
  "What does it mean to be a good citizen?",
  "Should celebrities be role models?",
  "Is it important to know how to cook?",
] as const;

// Speech lengths you can pick, in seconds (1, 2 or 3 minutes). Migration 0008 allows only these.
export const SPEECH_LENGTHS = [60, 120, 180] as const;
export type SpeechLength = (typeof SPEECH_LENGTHS)[number];

// What an impromptu recording carries with it: the topic and how long the speech was meant to be.
export type ImpromptuInfo = { topic: string; targetSeconds: SpeechLength };

// A random topic, never the same as the one you were just shown
export function randomTopic(current?: string): string {
  const choices = TOPICS.filter((t) => t !== current);
  return choices[Math.floor(Math.random() * choices.length)];
}

// Only topics from our own list count. Anything else (say, a hand-edited database row) is ignored,
// so text typed by a user can never reach the feedback prompt dressed up as "the topic".
export function isKnownTopic(topic: unknown): topic is string {
  return typeof topic === "string" && (TOPICS as readonly string[]).includes(topic);
}

export function isSpeechLength(seconds: unknown): seconds is SpeechLength {
  return typeof seconds === "number" && (SPEECH_LENGTHS as readonly number[]).includes(seconds);
}

// Reads the topic and target length saved on a recording row; null unless both are valid.
export function impromptuFromRow(row: { topic?: unknown; target_seconds?: unknown }): ImpromptuInfo | null {
  return isKnownTopic(row.topic) && isSpeechLength(row.target_seconds)
    ? { topic: row.topic, targetSeconds: row.target_seconds }
    : null;
}

// "1:05" style clock text for a number of seconds
export function formatClock(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

// How well the speech filled its time slot, worked out in code so it's the same every time
// (Claude only writes the comment). Real impromptu rounds allow a little over and a bit under.
export type TimeRating = "strong" | "okay" | "weak";
export function rateTimeUse(actualSeconds: number, targetSeconds: number): TimeRating {
  const share = actualSeconds / targetSeconds;
  if (share >= 0.85 && share <= 1.15) return "strong";
  if (share >= 0.65 && share <= 1.3) return "okay";
  return "weak";
}
