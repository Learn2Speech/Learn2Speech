// Checks for the small rules that decide outcomes. Run with: npm test (Node's own test runner, no packages).
import { test } from "node:test";
import assert from "node:assert/strict";
import { isOldEnough } from "../lib/age-check.ts";
import { duplicateIds } from "../lib/duplicates.ts";

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
