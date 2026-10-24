# Learn2Speech

A speech coaching web app for the 2026 Congressional App Challenge. Upload a recording of
yourself speaking and get your transcript, your pace (words per minute), your filler words
and long pauses, and personal coaching feedback.

**Live app:** https://learn2speech.vercel.app

## What it does
1. **Sign up / log in** with email and password.
2. **Upload** an audio file (mp3, wav or m4a, up to 50 MB). It's stored privately: only you can see your recordings.
3. **Analysis** runs on the server:
   - AssemblyAI turns the audio into a transcript with a timestamp for every word.
   - Our own code measures words per minute, filler words ("um", "uh", "hmm"...) and pauses longer than 1 second, then rates each one (for example "Good pace" or "Some fillers").
   - Claude (Anthropic API) reads the transcript and measurements and writes a short summary, what went well, and what to work on.
4. **Results:** the numbers with ratings, the coaching feedback, and the transcript with filler words and long pauses marked where they happened.
5. **History:** every past recording, each opening its saved results.

## Tech stack
- [Next.js](https://nextjs.org) (App Router) + TypeScript, [Tailwind CSS](https://tailwindcss.com), [shadcn/ui](https://ui.shadcn.com)
- [Supabase](https://supabase.com): login, Postgres database and file storage, with Row Level Security so users only ever see their own data
- [AssemblyAI](https://www.assemblyai.com): speech-to-text with word timestamps
- [Anthropic API](https://www.anthropic.com/api) (Claude): coaching feedback
- Hosted on [Vercel](https://vercel.com)

Every library, API and tool, with its license, is listed in [`docs/CREDITS.md`](docs/CREDITS.md).

## Run it yourself

### 1. What you need
- [Node.js](https://nodejs.org) **20.9 or newer** (we use 24) and npm
- A free [Supabase](https://supabase.com) account
- API keys for [AssemblyAI](https://www.assemblyai.com/dashboard) and [Anthropic](https://console.anthropic.com) (both are paid per use; short test clips cost very little)

### 2. Get the code
```bash
git clone https://github.com/Learn2Speech/Learn2Speech.git
cd Learn2Speech
npm install
```

### 3. Set up Supabase
1. Create a new Supabase project.
2. In the project, open **SQL Editor** and run each file in [`supabase/migrations/`](supabase/migrations) **in order**, one at a time:
   - `0001_recordings_bucket.sql`: the private storage bucket for audio files and its access rules
   - `0002_recordings_table.sql`: the `recordings` table with Row Level Security
   - `0003_recordings_results.sql`: columns for the status, transcript, metrics and feedback
3. Open **Authentication → URL Configuration** and set **Site URL** to `http://localhost:3000`, so the email confirmation link brings new users back to your local app.
4. Open **Project Settings → API** / **API Keys** and keep it open for the next step.

### 4. Add your keys
Copy the example file, then fill in the values in `.env.local`:
```bash
cp .env.example .env.local
```

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API Keys → the `anon` public key (newer projects call it the **publishable** key; either works) |
| `ASSEMBLYAI_API_KEY` | AssemblyAI dashboard → API Keys |
| `ANTHROPIC_API_KEY` | Anthropic Console → API Keys |

`.env.local` is git-ignored, so keys never get committed. The two API keys are only used in server code; never rename them to start with `NEXT_PUBLIC_`, which would send them to the browser.

### 5. Start the app
```bash
npm run dev
```
Open http://localhost:3000, sign up, confirm your email, and upload a short recording (10 to 30 seconds is plenty for a test).

### Other commands
```bash
npm run lint    # check the code for mistakes
npm run build   # production build; must pass before pushing
```

## Deploying to Vercel
1. Import the GitHub repository into Vercel (it detects Next.js automatically).
2. In **Settings → Environment Variables**, add the same four variables and tick both **Production** and **Preview**. Preview builds (one per pull request) fail without the Supabase keys.
3. In Supabase, add your Vercel address (for example `https://learn2speech.vercel.app`) to **Authentication → URL Configuration**.

Analysis can take a minute or more, so the analysis route allows up to 200 seconds (`maxDuration`). Shorter recordings finish faster.

## Project layout
- `app/`: pages and API routes (`app/api/recordings/[id]/analyze` runs the full analysis for one recording)
- `lib/transcription/`: the AssemblyAI request and response handling
- `lib/metrics/`: words per minute, filler words, pauses and their ratings, as plain functions
- `lib/feedback/`: the Claude prompt, request and reply checking
- `supabase/migrations/`: the database setup, in order
- `docs/`: credits and AI usage logs

## Team
- **Rian Desai:** transcription, metrics and ratings, AI feedback, user interface design (most UI code was written with Claude; see the AI logs)
- **Akshith:** login and sign-up, page protection, upload, storage and database, history, connecting the analysis pipeline

## AI use disclosure
We used AI tools while building this app, as allowed by the Congressional App Challenge rules. Every use is logged, by person and by session, in [`docs/ai-log/`](docs/ai-log), and commits Claude was involved in say how in their messages. The app itself uses Claude (Anthropic API) to write the coaching feedback.

## Privacy
Recordings and transcripts are personal data. They are stored in a private Supabase bucket and table protected by Row Level Security: the database only returns rows that belong to the logged-in user.
