# AI Usage Log: Akshith

Required for Congressional App Challenge AI disclosure. Akshith adds one entry at the end of every Claude Code session. Each person has their own file so branches never conflict.

Format: `Date | Who | Feature / files | What Claude did (explained / wrote / reviewed / debugged) | What the student wrote`

- 2026-10-17 | Akshith | Project rules: `CLAUDE.md`, `docs/AI_LOG.md` | Explained: the per-task workflow (branch → plan → small steps → lint/build → PR → log) and Claude's role. Ran: branch setup, lint/build, commit, push, PR. Wrote: this log entry | Akshith wrote the `CLAUDE.md` edits (rename SpeechCoach → Learn2Speech, "students" → "participants", the note on explaining code clearly with analogies)
- 2026-10-18 | Akshith | Login page: `lib/supabase.ts`, `app/login/page.tsx`, `package.json` (Supabase packages), `.env.local` setup | Explained: Supabase auth, `useState`, `"use client"`, `async/await`, `useRouter`, project layout. Showed (Akshith typed it): the `lib/supabase.ts` code and the login form layout (JSX/Tailwind). Reviewed: Akshith's code and found typos (`process.enc`, `x1` vs `xl`, wrong `useState` use, wrong import path, `event.setErrorMessage`). Debugged: the Supabase URL in `.env.local` had an extra `/rest/v1/` path. Gave hints only for the login logic | Akshith wrote the login logic himself from hints (the three state variables, the submit function, the Supabase `signInWithPassword` call, showing the error, and the redirect on success) and typed all the files
