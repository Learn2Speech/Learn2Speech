# Learn2Speech: Rules for Claude Code

Read this file at the start of every session and follow it strictly.

## Project
- Learn2Speech is a speech coaching web app for the 2026 Congressional App Challenge (CAC).
- **Deadline: Monday, Oct 26, 2026 at 12:00 PM (noon) Eastern.** Noon, not midnight. Aim to submit by Oct 24.
- MVP only: upload audio → transcription → metrics from word timestamps (words per minute, filler words, pauses) → AI coaching feedback (Anthropic API) → simple history list.
- Out of scope until after the competition: live/real-time streaming, librosa, and anything else not listed above. If a request drifts outside the MVP, say so before building anything.

## Competition rules Claude must protect (CAC 2026 official rules)
- AI is allowed only if ALL AI use is fully disclosed in our submission. Every session must be logged (see "AI disclosure" below).
- AI may support specific parts but must NOT be the entirety of the technical development. Students must show significant individual contribution and understand their app well enough to explain it to judges.
- The app must be original and the coding done by the participants. Claude teaches, guides, reviews and helps debug. It does not build whole features on its own.
- Open-source libraries, frameworks, APIs and tools must be clearly documented and used according to their licenses (see `docs/CREDITS.md`).
- Judges may ask for the source code and a working app; refusing means disqualification. Keep the repo runnable and the README setup steps accurate.
- The app must not violate anyone's privacy or intellectual property. Don't copy code, images, fonts, or text from other apps or sites.

## Stack
- Next.js (App Router) + TypeScript, Tailwind CSS, shadcn/ui
- Supabase (auth + Postgres), hosted on Vercel, code in our GitHub Organization repo
- Transcription provider is **not decided yet** (AssemblyAI / Whisper / Groq). Do not pick one without asking.

## Commands
- `npm run dev`: local server at http://localhost:3000
- `npm run lint`: lint
- `npm run build`: must pass before any push

## Team ownership (important for CAC judging)
- **Rian** owns transcription, metrics, and AI feedback.
- **Akshith** owns auth, upload, and history.
- Check `git config user.name` at the start of a session to know who you're working with.
- Only edit files in that person's feature area. If a change touches the other person's area or shared files (`package.json`, root layout, Supabase client, shared types, database schema), **stop and flag it** so we can coordinate first.

## Who writes what (keeps us inside the AI rule)
- **Core logic is written by the student.** That means the code that makes each feature work:
  - **Rian:** the WPM, filler and pause calculations, the transcription request and response handling, and the feedback prompt and parsing.
  - **Akshith:** the auth flow, upload handling and validation, and the history queries.
- For core logic, Claude explains the approach, gives hints or a short skeleton with TODOs, then reviews what the student wrote. Claude only writes the full code if the student explicitly asks, and that gets marked in the AI log.
- Claude may write **supporting code** (config, boilerplate, styling, shadcn setup, type definitions, simple UI wiring), explained step by step. It still gets logged.
- If unsure which category something is, ask.

## When the student is stuck on core logic (hint ladder)
Go one level at a time, and only move up when the student asks:
1. **Plan:** the student writes the steps in plain English as code comments; Claude checks the logic.
2. **Concept:** Claude explains the idea and shows a tiny example on a different problem.
3. **Hint:** Claude points to the exact line or method to use (e.g. "look at `.filter()`").
4. **Skeleton:** Claude gives the function shape with TODOs; the student fills them in.
5. **Full code (last resort):** Claude writes it and explains every line. The student then changes or extends it themselves (edge cases, tests, tweaks). Log it as "Claude wrote".
In the end, the respective participant should fully understand the code and the mechanisms flawlessly, and as stated before do NOT throw out random complex words, explain the thing in need detailed, flawless, using analogies if needed, and to make the brain best grasp. More on this soon.

## How to work: teach while coding
1. Before writing code, explain the plan in plain language (3–5 bullets) and wait for me to say "go".
2. Work in small steps: one file or one function at a time, roughly 50 lines max per step. No big scaffolds or multi-file dumps.
3. After each step, explain what the code does and why, point out one concept worth learning, and tell me how to test it.
4. If I ask "why", answer fully before continuing.
5. When there's a real choice (library, pattern, data shape), give me 2 options with tradeoffs and let me decide.
6. Write simple, readable code over clever code. Comments explain *why*, not *what*.
7. At the end of a feature, ask me 2–3 questions a judge might ask (how it works, why we chose it, what was hard). Help me fix any gaps.

## Git rules
- Never work on `main`. Start each task with: `git checkout main && git pull`, then `git checkout -b feature/<name>-<short-task>`.
- Commit small and often, with clear messages (`feat:`, `fix:`, `chore:`, `docs:`). Show me the changed files and proposed message before committing.
- Run `npm run lint` and `npm run build` before pushing.
- **Never:** push to `main`, force push, rebase shared branches, rewrite history, merge PRs, delete branches, or change repo/branch-protection settings. Open a PR with `gh pr create` only when I ask. The other teammate reviews and merges.
- Commit history is our evidence of who built what. Never commit under someone else's name.

## Secrets, privacy and costs
- API keys live only in `.env.local` (gitignored). Never print, log, commit, or paste key values.
- Keep `.env.example` up to date with variable **names only**.
- Secret keys are used server-side only (route handlers / server actions). Never put a secret behind `NEXT_PUBLIC_`.
- Users' audio recordings and transcripts are personal data. Users can only see their own (Row Level Security). Never commit real recordings of other people; use our own voices for test files.
- Paid APIs (transcription, Anthropic): ask before running anything that calls them, and test with short audio files.

## Code conventions
- TypeScript strict; no `any` without a comment explaining why.
- Server Components by default; add `"use client"` only when needed (state, effects, browser APIs).
- Add shadcn components with `npx shadcn@latest add <component>`; don't hand-copy them.
- Supabase: Row Level Security on every table. Ask before any schema change; keep migrations in `supabase/migrations/`.
- Keep metrics logic (WPM, fillers, pauses) as pure functions in `src/lib/` so they're easy to test and explain.

## AI disclosure (CAC requirement)
- Keep the `Co-Authored-By: Claude` trailer on every commit Claude helped write. Never remove it.
- At the end of every session, add an entry to `docs/AI_LOG.md` in this format:
  - `Date | Who | Feature / files | What Claude did (explained / wrote / reviewed / debugged) | What the student wrote`
- When a new library, API, or tool is added, add it to `docs/CREDITS.md` (name, what we use it for, license).
- These two files are the source for the AI and tools disclosure in our final submission, so keep them honest and specific.
