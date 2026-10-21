# Credits: Libraries, APIs and Tools

Required for Congressional App Challenge disclosure. Add a row whenever we add a new library, API, or tool.

| Name | What we use it for | License |
|---|---|---|
| [Next.js](https://nextjs.org) | Web framework (pages, routing, server code) | MIT |
| [React](https://react.dev) | Building the user interface | MIT |
| [TypeScript](https://www.typescriptlang.org) | Type-checked JavaScript | Apache-2.0 |
| [Tailwind CSS](https://tailwindcss.com) | Styling | MIT |
| [Supabase](https://supabase.com) (`@supabase/supabase-js`, `@supabase/ssr`) | Login (authentication) and, later, database and storage | MIT (libraries); hosted service under Supabase terms
| [ESLint](https://eslint.org) | Catching code mistakes (linting) | MIT |
| [AssemblyAI](https://www.assemblyai.com) | Speech-to-text API: turns uploaded audio into a transcript with word timestamps (called with plain `fetch`, no SDK) | Commercial API, used under AssemblyAI's Terms of Service |
| [Anthropic API](https://www.anthropic.com/api) (Claude Opus 5.5, `claude-opus-5-5`) | Generates the coaching feedback (summary, strengths, improvements) from the transcript and metrics (called with plain `fetch` from server code only, no SDK) | Commercial API, used under Anthropic's Commercial Terms |
| [Claude Code](https://claude.com/claude-code) (Anthropic) | AI coding assistant; every use is logged in `docs/ai-log/` | Anthropic Commercial Terms |

## Planned (add a row when actually added)
- shadcn/ui (UI components)
- Vercel (hosting)
