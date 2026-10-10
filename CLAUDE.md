# SpeechCoach: Rules for Claude Code

Read this file at the start of every session and follow it strictly.

## Project
- SpeechCoach is a speech coaching web app for the Congressional App Challenge (CAC). **Deadline: Oct 26, 2026.**
- MVP only: upload audio → transcription → metrics from word timestamps (words per minute, filler words, pauses) → AI coaching feedback (Anthropic API) → simple history list.
- Out of scope until after the competition: live/real-time streaming, librosa, and anything else not listed above. If a request drifts outside the MVP, say so before building anything.

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

## How to work: teach while coding
1. Before writing code, explain the plan in plain language (3–5 bullets) and wait for me to say "go".
2. Work in small steps: one file or one function at a time, roughly 50 lines max per step. No big scaffolds or multi-file dumps.
3. After each step, explain what the code does and why, point out one concept worth learning, and tell me how to test it.
4. If I ask "why", answer fully before continuing.
5. When there's a real choice (library, pattern, data shape), give me 2 options with tradeoffs and let me decide.
6. Write simple, readable code over clever code. Comments explain *why*, not *what*.
7. At the end of a feature, ask me 1–2 quick questions to check I can explain what we built.

## Git rules
- Never work on `main`. Start each task with: `git checkout main && git pull`, then `git checkout -b feature/<name>-<short-task>`.
- Commit small and often, with clear messages (`feat:`, `fix:`, `chore:`, `docs:`). Show me the changed files and proposed message before committing.
- Run `npm run lint` and `npm run build` before pushing.
- **Never:** push to `main`, force push, rebase shared branches, merge PRs, delete branches, or change repo/branch-protection settings. Open a PR with `gh pr create` only when I ask. The other teammate reviews and merges.

## Secrets and costs
- API keys live only in `.env.local` (gitignored). Never print, log, commit, or paste key values.
- Keep `.env.example` up to date with variable **names only**.
- Secret keys are used server-side only (route handlers / server actions). Never put a secret behind `NEXT_PUBLIC_`.
- Paid APIs (transcription, Anthropic): ask before running anything that calls them, and test with short audio files.

## Code conventions
- TypeScript strict; no `any` without a comment explaining why.
- Server Components by default; add `"use client"` only when needed (state, effects, browser APIs).
- Add shadcn components with `npx shadcn@latest add <component>`; don't hand-copy them.
- Supabase: Row Level Security on every table. Ask before any schema change; keep migrations in `supabase/migrations/`.
- Keep metrics logic (WPM, fillers, pauses) as pure functions in `src/lib/` so they're easy to test and explain.

## AI disclosure (CAC requirement)
- Keep the `Co-Authored-By: Claude` trailer on commits Claude helps write.
- At the end of each session, add one line to `docs/AI_LOG.md`: date, who, what Claude helped with.
