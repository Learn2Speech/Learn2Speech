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
| [shadcn/ui](https://ui.shadcn.com) (`shadcn` CLI, `cn`) | Ready-made UI components (cards, buttons, inputs, sidebar), added with `npx shadcn@latest add` | MIT |
| [Base UI](https://base-ui.com) (`@base-ui/react`) | The accessible building blocks shadcn/ui components are built on | MIT |
| [Lucide](https://lucide.dev) (`lucide-react`) | Icons (microphone, upload, history, etc.) | ISC |
| [class-variance-authority](https://cva.style) | Button and badge style variants (used inside shadcn/ui components) | Apache-2.0 |
| [tw-animate-css](https://github.com/Wombosvideo/tw-animate-css) | Small animations (sidebar slide-out on phones) | MIT |
| [Bricolage Grotesque](https://fonts.google.com/specimen/Bricolage+Grotesque) | Heading font, loaded from Google Fonts with `next/font` | SIL Open Font License 1.1 |
| [Geist font](https://vercel.com/font) | The app's typeface, loaded with `next/font` | SIL Open Font License 1.1 |
| Learn2Speech logo | Designed with Claude (Anthropic) at Rian's direction; redrawn as SVG code by Claude Code in `components/brand/logo.tsx` | Our own; AI use disclosed in `docs/ai-log/rian.md` |
| [Claude Code](https://claude.com/claude-code) (Anthropic) | AI coding assistant; every use is logged in `docs/ai-log/` | Anthropic Commercial Terms |

## Planned (add a row when actually added)
- Vercel (hosting)
