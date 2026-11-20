// Checks for the small rules that decide outcomes. Run with: npm test (Node's test runner; tsx reads TypeScript and "@/").
import { test } from "node:test";
import assert from "node:assert/strict";
import { isOldEnough } from "@/lib/age-check";
import { duplicateIds } from "@/lib/duplicates";
import { parseFeedback } from "@/lib/feedback/anthropic";
import { compareScript } from "@/lib/script/compare-script";
import { wordsPerMin } from "@/lib/metrics/wpm";

test("age check: 13+ only, and this month's birthday counts as not yet", () => {
  const today = new Date(2026, 10, 15); // 15 Nov 2026
  assert.equal(isOldEnough(2013, 10, today), true); // turned 13 in October
  assert.equal(isOldEnough(2013, 11, today), false); // birthday this month: played safe
  assert.equal(isOldEnough(2013, 12, today), false); // turns 13 next month
  assert.equal(isOldEnough(1990, 1, today), true);
});

const row = (id: string, created_at: string, status = "done", size_bytes = 100, duration_ms: number | null = 5000) =>
  ({ id, created_at, status, size_bytes, duration_ms });

test("duplicates: a later copy of the same audio is the duplicate", () => {
  const rows = [row("a", "2026-01-01"), row("b", "2026-01-02"), row("c", "2026-01-03", "done", 200)];
  assert.deepEqual([...duplicateIds(rows)], ["b"]);
});

test("duplicates: the finished copy wins over an older failed one", () => {
  const rows = [row("failed", "2026-01-01", "failed", 100, null), row("redo", "2026-01-02")];
  assert.deepEqual([...duplicateIds(rows)], ["failed"]);
});

test("duplicates: same size but a different length is a different speech", () => {
  assert.equal(duplicateIds([row("a", "2026-01-01"), row("b", "2026-01-02", "done", 100, 9000)]).size, 0);
});

const reply = JSON.stringify({ summary: "Clear and calm.", strengths: ["Good pace"], improvements: [{ area: "Fillers", tip: "Pause instead of um." }] });

test("Claude reply: good JSON is read, extra fields are dropped", () => {
  const feedback = parseFeedback(reply.replace("}", ', "evil": "x"}'));
  assert.equal(feedback.summary, "Clear and calm.");
  assert.equal("evil" in feedback, false);
});

test("Claude reply: text or code fences around the JSON are fine", () => {
  assert.equal(parseFeedback("Here you go:\n```json\n" + reply + "\n```").strengths[0], "Good pace");
});

test("Claude reply: missing parts or no JSON give a friendly error", () => {
  assert.throws(() => parseFeedback(JSON.stringify({ strengths: [], improvements: [] })), /garbled/);
  assert.throws(() => parseFeedback("Sorry, I can't help."), /garbled/);
});

const said = (text: string) => text.split(" ").map((w, i) => ({ text: w, start: i * 400, end: i * 400 + 300, confidence: 1 }));

test("script: skipped words are found, fillers don't count as added", () => {
  const script = "We should plant more trees in every city because they cool the streets";
  const result = compareScript(script, said("We should um plant more trees because they cool the streets"));
  assert.equal(result.scriptWords, 13);
  assert.equal(result.coverage, 77); // 10 of 13 said
  assert.deepEqual(result.added, []);
});

test("pace: under 5 seconds of speech is too short to measure", () => {
  assert.equal(wordsPerMin(said("hi there")), 0);
  assert.equal(wordsPerMin(said("one two three four five six seven eight nine ten eleven twelve thirteen fourteen")), 153);
});
