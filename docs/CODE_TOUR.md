# Code tour

A map of Learn2Speech for judges and for us. It follows one recording from upload to results.
Every file also starts with a short summary comment saying what it does.

## The journey of one recording

```
Upload page ──► Supabase Storage + database row ──► Analyze route
                                                        │
        ┌───────────────────────────────────────────────┤
        ▼                         ▼                      ▼
  1. Transcribe              2. Measure             3. Coach
  (AssemblyAI)           (our own math)           (Claude / Anthropic)
        └───────────────────────────────────────────────┤
                                                        ▼
                                   Saved on the recording row ──► Results page
```

1. **Upload** (`app/(app)/upload/page.tsx`): the user picks an audio file. It is checked
   (`lib/validate-audio.ts`), saved to a private Supabase bucket under the user's own folder
   (`lib/build-audio-path.ts`), and a row is added to the `recordings` table.
2. **Analyze** (`app/api/recordings/[id]/analyze/route.ts`): the server confirms who the user is,
   makes a temporary link to the audio (`lib/create-audio-url.ts`), then runs steps 1 to 3 below
   and saves everything on the recording's row. If anything fails, the row is marked `failed`
   with a readable reason.
3. **Results** (`app/(app)/history/[id]/page.tsx`): reads the saved row and draws it with the
   components in `components/results/`.
4. **History** (`app/(app)/history/page.tsx`): the list of the user's own recordings.

## Step 1: Transcription, `lib/transcription/`
- `assemblyai.ts` sends the audio link to AssemblyAI, then checks every 5 seconds until the
  transcript is ready (or fails, or 3 minutes pass). Called with plain `fetch`, on the server only.
- `types.ts` defines a `Transcript`: the full text, every word with start and end times in
  milliseconds, and the total length.

## Step 2: Measurements, `lib/metrics/`
Pure functions: numbers in, numbers out, no network. That makes them easy to test and explain.
- `wpm.ts`: words per minute, from the first word's start to the last word's end.
- `fillers.ts`: finds "um", "uh", "hmm" and similar, and when each was said.
- `pauses.ts`: finds silences longer than 1 second between words.
- `calculateMetrics.ts`: runs all three and returns one `SpeechMetrics` object.
- `describe.ts`: turns the numbers into ratings like "Good pace" (fillers and pauses are rated per minute).

## Step 3: Coaching feedback, `lib/feedback/`
- `buildPrompt.ts`: writes the instructions for Claude, including our measured numbers.
- `anthropic.ts`: sends the prompt to the Anthropic API, checks for errors, and parses Claude's
  JSON reply into a `CoachingFeedback` (summary, strengths, improvements).
- `getFeedback.ts`: runs measure, prompt, ask and parse in order.
- `types.ts`: the shape of the feedback.

## Showing the results, `components/results/`
- `metrics-cards.tsx`: three cards (pace, fillers, pauses) with rating badges.
- `speech-timeline.tsx`: the whole speech as one bar, with a mark for each filler and pause.
- `feedback-panel.tsx`: Claude's summary, strengths and numbered improvements.
- `transcript-view.tsx`: the transcript with fillers and pauses marked where they happened.
- `results-view.tsx`: puts the four pieces above in reading order.

## Accounts and privacy
- Login and sign-up use Supabase Auth. `proxy.ts` sends logged-out visitors away from
  `/upload` and `/history`.
- Row Level Security (see `supabase/migrations/`) means every query only returns the signed-in
  user's own rows and files. Even the code can't read someone else's recording.
- The AssemblyAI and Anthropic keys are only read on the server, so the browser never receives
  them. The Supabase key the browser uses is the public "anon" key; Row Level Security is what
  protects the data.

## Who wrote what
Rian wrote the transcription, metrics and feedback code. Akshith wrote auth, upload and history.
Claude helped with explanations, review, debugging and supporting code such as styling. Every
session is recorded in `docs/ai-log/`, and every library is listed in `docs/CREDITS.md`.
