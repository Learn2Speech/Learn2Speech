# AI Usage Log: Rian

Required for Congressional App Challenge AI disclosure. Rian adds one entry at the end of every Claude Code session. Each person has their own file so branches never conflict.

Format: `Date | Who | Feature / files | What Claude did (explained / wrote / reviewed / debugged) | What the student wrote`

- 2026-10-09 | Rian | Onboarding: `CLAUDE.md`, `.env.example`, `.gitignore`, `docs/AI_LOG.md` | Explained: Claude Code setup steps for Akshith, git branch → PR → merge flow. Wrote: `.env.example`, this log, `.gitignore` rule, partner name in `CLAUDE.md` | Rian decided what to change and reviewed every file before the commit
- 2026-10-16 | Rian | Project rules: `CLAUDE.md`, `docs/AI_LOG.md`, `docs/CREDITS.md` | Wrote: Markdown formatting for Rian's revised rules, Akshith's name in place of the placeholder, this log's new format, `docs/CREDITS.md` | Rian wrote the revised rules (CAC competition rules, who writes what, hint ladder, new log format)
- 2026-10-18 | Rian | Transcription: `lib/transcription/types.ts`, `lib/transcription/assemblyai.ts`, `app/api/transcribe/route.ts`, `.env.example`, `docs/CREDITS.md`, `CLAUDE.md` | Explained: fetch, polling, async/await, .map(), ??, narrowing, route handlers, env vars (hint levels 1–2 for each step); reviewed every step; debugged with Rian. Wrote: `types.ts` (supporting code), the return block mapping words into Transcript (at Rian's request), the two standard Next.js lines in the route, `.env.example`/`CREDITS.md`/`CLAUDE.md` edits | Rian wrote: the plan, API key check, submitting the job, polling loop with timeout and error handling, no-speech check, route validation and error handling; ran all tests including the real AssemblyAI transcription
