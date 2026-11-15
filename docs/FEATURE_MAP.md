# Feature map

Where each practice feature lives in the code, so you can open one feature and see all of its pieces.
Shared plumbing is listed at the bottom.

## Topic mode (type what your speech is about)

A popup asks for your topic, or you can choose "Go topic-free". Get feedback rejects keysmash topics. An
accepted topic sets the pace target for that kind of speech and adds tips for that topic.

| Piece | File |
|---|---|
| Speech types and their pace targets | `lib/topic/speech-types.ts` |
| Free keysmash check (browser and server) | `lib/topic/check-topic.ts` |
| Claude topic check (server, before transcription) | `lib/topic/classify-topic.ts` |
| Topic popup | `components/topic/topic-dialog.tsx` |
| "Can't evaluate that topic" popup | `components/topic/topic-rejected-dialog.tsx` |
| Topic line above the buttons | `components/topic/topic-bar.tsx` |
| Results section (on topic, tips) | `components/topic/topic-review.tsx` |

## Live filler counter (Record page)

Starts on for Impromptu and off for free practice, and a switch changes it. While you record, the browser's
speech recognition counts your ums. It only starts on by itself when it can run on your device; otherwise it
stays off and the switch says where the audio goes before you turn it on.

| Piece | File |
|---|---|
| Browser speech-recognition wrapper and support check | `lib/live-fillers/speech-recognition.ts` |
| Counting fillers in live text (same list as the results) | `lib/live-fillers/count-fillers.ts` |
| Hook: listen while recording, keep the count | `components/live-fillers/use-live-fillers.ts` |
| On/off switch with the privacy line | `components/live-fillers/live-filler-toggle.tsx` |
| The running count | `components/live-fillers/live-filler-counter.tsx` |

## Script mode (practice a written speech)

Paste your script, speak, and see what you skipped, what you added, and your pace in each part. The
comparison is done in code. Claude only adds a comment and tips.

| Piece | File |
|---|---|
| Types | `lib/script/types.ts` |
| Compare script with transcript (word matching, per-part pace) | `lib/script/compare-script.ts` |
| Script popup | `components/script/script-dialog.tsx` |
| Script line with "Show my script" | `components/script/script-bar.tsx` |
| Hook: the script and its popup | `components/script/use-script.tsx` |
| Results section | `components/script/script-review.tsx` |

## Redo a speech (side-by-side compare)

"Redo this speech" on a results page opens `/record?redo=<id>`, which reuses the earlier topic and script. The
new results then start with both takes side by side.

| Piece | File |
|---|---|
| Read `?redo=` and load the earlier take | `lib/redo/load-redo.ts` |
| Hook used by the Record page | `components/redo/use-redo.ts` |
| "Redoing ..." banner | `components/redo/redo-banner.tsx` |
| Side-by-side table on results | `components/redo/redo-compare.tsx` |
| "Redo this speech" button | `app/(app)/history/[id]/page.tsx` |

## Impromptu mode

| Piece | File |
|---|---|
| Topic list, lengths (0:30 to 5:00), time rating | `lib/impromptu/topics.ts` |
| The `/impromptu` page (same recorder as `/record`, impromptu mode) | `app/(app)/impromptu/page.tsx` |
| Impromptu setup, length stepper and countdown | `components/record/practice-recorder.tsx` |
| Topic reel animation | `components/impromptu/topic-reel.tsx` |
| "How impromptu works" popup (first visit) | `components/impromptu/impromptu-intro.tsx` |
| Results section | `components/results/impromptu-review.tsx` |

## Shared plumbing

| Piece | File |
|---|---|
| "Get feedback" step: checks the topic, uploads, sends topic, script and redo | `components/practice/use-get-feedback.tsx` |
| Upload a file and call the analyze route | `lib/upload-recording.ts` |
| Analyze route: checks, transcription, feedback, save | `app/api/recordings/[id]/analyze/route.ts` |
| Feedback pipeline | `lib/feedback/getFeedback.ts` |
| Prompt (base plus optional impromptu, topic and script sections) | `lib/feedback/buildPrompt.ts` |
| Reading Claude's reply safely | `lib/feedback/anthropic.ts` |
| Saved feedback shape (`feedback.topic`, `.script`, `.redoOf`) | `lib/feedback/types.ts` |
| Results page layout | `components/results/results-view.tsx` |

Topic, script and redo data are stored inside the `feedback` column, which only the server writes, so none of
these features needed a database migration.
