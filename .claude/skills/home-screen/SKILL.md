---
name: home-screen
description: /home-screen — the Learn2Speech UI guide for the WHOLE app, not just the home page. Layout, colour, type, components, motion, sound, accessibility (WCAG 2.2 AA), copy and a ship checklist, so any new page, component or change looks and behaves like the rest. Use before building or changing ANY page or component, any visual, motion or sound change, or when asked what the app's design rules are. After a big design change ships, add it to the Design log at the bottom.
---

# /home-screen: the Learn2Speech UI guide

Read this before building or changing any page or component. Follow it and a new page will look, move, sound
and behave like the rest of the app. `DESIGN.md` (design system) and `PRODUCT.md` (audience, principles) are the
source documents and win if they disagree; this file is the practical version with the code names.

**The one-line version:** a type-specimen page: one giant teal word or number, plain ink on a quiet ground,
hairline rules, orange only on things you press, short literal copy, one deliberate motion moment, everything
usable by keyboard and screen reader at 4.5:1 contrast.

## 1. Who it's for and the tone

High-school students practicing speeches (class, debate, Model UN), plus adults. Serious enough for an adult,
clear enough for a ninth grader. Never invent numbers, users, prices or testimonials; label every made-up result
"Example". Privacy is stated plainly.

## 2. Page anatomy (copy these patterns)

- **Shell.** Pages under `app/(app)/` get the top bar (`SiteNav`) and footer (`SiteFooter`) from
  `app/(app)/layout.tsx`. Auth pages (`app/login`, `app/signup`, `app/forgot-password`) use `AuthCard`, no nav.
- **Container.** `mx-auto w-full max-w-7xl px-6 py-12` (24px side gutter at every width). Long reading pages
  (Privacy, Terms) use `max-w-[70ch]` so lines stay 65–75 characters.
- **Split.** Wide sections split 5/7 or 7/5: `grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16`.
  Big element on one side, words on the other. Phones stack in reading order.
- **Page header.** `PageHeader` (`components/page-header.tsx`): h1 `text-4xl sm:text-5xl font-semibold`
  plus one muted sentence. Every page has exactly one h1.
- **The specimen.** One giant teal word/number per screen, from real content:
  `text-[clamp(6rem,18vw,12rem)] leading-[0.8] font-black tracking-[-0.04em] text-(--brand) tabular-nums`,
  `aria-hidden` when the same fact is also said in words nearby. Examples: home "um", Record clock, About "77%",
  404 "404".
- **Sections.** Open with an ink rule: `border-t border-foreground pt-6`; heading `text-2xl font-semibold` on
  the left, text `text-lg leading-relaxed text-muted-foreground max-w-[65ch]` on the right (see About).
  80–112px between sections.
- **Teal block.** At most one per screen: `on-teal bg-teal rounded-lg p-6 sm:p-10`. `.on-teal` re-tints
  text/borders inside it so contrast holds.
- **Example box.** 1px `border` line, 8px radius, 20–24px padding, small "Example" caption above.
- **Tab title.** Every page sets a short `metadata.title` ("History"); the root template adds
  " | Learn2Speech". Client pages (`"use client"`) can't export metadata, so give their folder a tiny
  `layout.tsx` that only sets the title (see `app/login/layout.tsx`).
- **Missing things.** Call `notFound()`; it renders `app/(app)/not-found.tsx` (giant "404", way home).
- **Practice pages** start with `PracticeSwitch` (Record | Upload a file).

## 3. Colour (tokens in `app/globals.css`, light and dark)

| Role | Light | Dark | Use |
|---|---|---|---|
| Paper `--background` | #F3F5F4 | #0C0F10 | the page |
| Ink `--foreground` | #0E1314 | #E4EAE9 | text, section rules |
| Muted ink `--muted-foreground` | #556062 | | secondary text (passes 4.5:1) |
| Line `--border` | #D8DEDC | | hairlines |
| Teal `--teal` | #0F5E68 | #0D3A41 | blocks |
| Teal mark `--brand` / `--teal-mark` | #1B8591 | #4FB3BC | giant words, waveform, rings |
| Orange `--primary` | #C4521C | #E8793F | buttons, slider handle, tutorial outline, filler marks |

Rules: about 50% neutral, 30% teal, 20% orange. **If it's orange and bigger than a word, it can be pressed or
dragged.** Never an orange background. Never a raw hex in a component: use the tokens.
**Teal mark (#1B8591) on paper is only 3.98:1: fine for giant type, NOT for small text or links.** Small teal
text uses `--teal` (#0F5E68) or ink.

## 4. Type

One typeface, Archivo (variable: weight 100–900, width 62–125%), loaded in `app/layout.tsx`. No second font.
- Specimen: 900 weight, see above. Headline 600, 2.25–3rem, leading 1.02. Title 600, 1.25–1.875rem.
  Body 400, 1.125rem, max ~65ch. Label 500, 0.875rem.
- **Width is data:** `font-stretch` only changes to show pace. Never condensed/extended for style.
- A filler word in large text is thin (weight 100) and orange; in small text a soft orange highlight.

## 5. Components (reuse, don't rebuild)

- `Button` / `buttonVariants` (`components/ui/button.tsx`). Main actions `size="lg"` with `className="h-12 px-6"`.
  Primary = default (orange). Secondary next to it = `variant="outline"` with `border-foreground/30!`.
  Links that look like buttons: `<Link className={buttonVariants(...)}>`. Ghost/icon buttons for the top bar.
- `AuthCard`, `AuthMessage` (errors shake, success green) in `components/auth/auth-card.tsx`.
- `PageHeader`, `PracticeSwitch`, `Reveal` (scroll-in for home steps), `Tour` (tutorial bar), `Logo`/`LogoMark`.
- shadcn primitives in `components/ui/` (dialog, dropdown-menu, input, label, sheet, tooltip...). The dialog has
  no backdrop blur on purpose (no glass).
- Icons: `lucide-react` only, one stroke weight. No emoji or unicode glyphs as icons.

## 6. Motion

One ease `cubic-bezier(0.23, 1, 0.32, 1)`. Entrances 600ms, presses 150ms, everything else under 300ms.
Only animate `transform` and `opacity` (and a font axis once). Every animation lives inside
`@media (prefers-reduced-motion: no-preference)` so it simply doesn't run for people who turned motion off.

Ready-made classes in `app/globals.css`:
| Class | What | Used on |
|---|---|---|
| `um-in` | word grows hairline → heavy once | home "um" |
| `um-wave` | 3 hairline rings pulse out, 3 times, stop | behind home "um" |
| `rise-in` | text slides up after the specimen | home hero copy |
| `reveal` (via `<Reveal>`) | children slide up on scroll | home steps |
| `press-spring` | squish + overshoot on press | default/outline/destructive `Button` (automatic) |
| `shake` | 4px shake once | `AuthMessage` errors (automatic) |
| `pop-in` | springy scale-in | mic-check success tick |
| `wave-bar` | looping bars | upload/analyze waiting screen |

Principles (from the "20 Principles of UX & Animation" reel and research):
- **One authored moment per screen**, tied to content; never scattered effects or endless loops next to text.
- **Squash and follow-through** on main buttons; **frequency of use**: often-used controls (top-bar icons)
  move less. **Exaggerated feedback** for errors. Respond to a press within 400ms (button label switches to
  "Working..." at once).
- Worth reaching for later: anticipation (tiny wind-up), secondary action (check flourish after save),
  staging (draw focus with colour or grayscale, never by fading text below 4.5:1; see the tutorial).

## 7. Sound

Quiet Web Audio tones from `components/ui-sounds.tsx`, ON by default (product owner's call), speaker button in
the top bar mutes (remembered per device). Every button press gets "tap" automatically; a button can ask for
`data-sound="start" | "stop" | "tick"`. Sliders tick (throttled). Rules: 30–150ms, very quiet, only on
meaningful actions, never hover/typing/scrolling/focus, always alongside a visual change, nothing depends on
hearing it. Nothing plays on page load (browsers block it anyway).

## 8. Accessibility (required: WCAG 2.2 AA)

Why it matters: in the US, courts treat **WCAG 2.1 AA** as the working benchmark in ADA website lawsuits
(thousands filed a year); WCAG 2.2 AA includes 2.1 AA, so target **2.2 AA**. The six most common failures on the
web, every year: low-contrast text, missing alt text, missing form labels, empty links, empty buttons, missing
page language. (General research, not legal advice.)

Every page and component must:
- **Contrast:** body/small text ≥ 4.5:1, large text (24px+, or 18.7px bold) ≥ 3:1, icons/borders that carry
  meaning ≥ 3:1. Check BOTH themes and text on teal blocks. Faded or "not yet active" text still counts:
  if people may need to read it, it must pass.
- **Keyboard:** everything works with Tab / Shift+Tab / Enter / Space / arrows, in a logical order, no traps.
  Focus is always visible (our ring: `focus-visible:ring-3 ring-ring/50`); never `outline-none` without a
  replacement. Focused items must not be hidden behind the fixed tutorial bar or cookie notice (2.4.11).
- **Skip link:** a "Skip to content" link as the first focusable thing (2.4.1).
- **Names:** every input has a `<label>`; icon-only buttons have `aria-label`; links say where they go;
  toggles use `aria-pressed`; decorative graphics are `aria-hidden`; real images have `alt`.
- **Structure:** one h1, headings in order, `<main>`, `<nav>`, `<footer>` landmarks, `lang="en"`.
- **Status and errors:** errors use `role="alert"` (as `AuthMessage` does) and say what went wrong and how to
  fix it; changing status (waiting screen, tutorial step) uses `role="status"` / `aria-live="polite"`.
- **Targets:** at least 24×24px (2.5.8), main actions 44–48px; icon buttons grow to 44px on phones
  (`max-sm:size-11`).
- **Pointer:** anything done by dragging also works with a click or keys (2.5.7); our slider is a native
  `<input type="range">`, so it does.
- **Login (3.3.8):** never block paste in password or code fields; allow password managers.
- **Motion and sound:** respect `prefers-reduced-motion`; nothing flashes more than 3 times a second; sounds
  are optional and short.
- **Zoom/reflow:** works at 200% zoom and at 320px wide with no sideways scrolling.
- **Media:** our video lives on YouTube; make sure it has accurate captions there.
- **Accessibility statement:** keep an /accessibility page saying we target WCAG 2.2 AA and how to report a
  problem (learn2speechteam@gmail.com).

How to test: Lighthouse accessibility via the chrome-devtools MCP (`lighthouse_audit`) on each changed page,
`/impeccable` detect for contrast and line length, a keyboard-only pass (Tab through the page), and VoiceOver
(Cmd+F5 on Mac) on new flows. Lighthouse only catches about a third of issues, so the manual passes matter.

Sources: W3C "What's New in WCAG 2.2"; WebAIM Million 2026 (via Priority Pixels, Nexer); promise.legal "ADA
website accessibility 2026"; allaccessible.org "Accessibility lawsuits in 2026"; Level Access WCAG 2.2 summary;
BOIA "What's new in WCAG 2.2"; Deque WCAG 2.2 updates.

## 9. Copy

Short and literal. Buttons name their action ("Upload a practice run", "Get feedback", not "Submit").
Errors say what happened and what to do ("That code is wrong or has expired. Check the newest email, or send a
new code."). Plain words a ninth grader knows. Show the speech, don't describe the product.

## 10. Home screen extras (research, Nov 2026)

1. One job, one main action; a quiet secondary at most.
2. The main action stays in the first viewport on phones.
3. Show the product: the giant "um" plus the pace slider over a real sample speech.
4. One authored motion moment (the "um" entrance + rings), then stillness.
5. Restraint: one hero object, minimal background, one accent.
6. Variable fonts for motion and data (weight for the entrance, width for pace).
7. Fast and accessible.

Sources: Muzli 2026 trends; raw.studio and StudioMeyer on kinetic type; Framer text-animation guide; Awwwards
variable-font collections; Omniconvert hero examples; saasui.design ElevenLabs; Contra voice-AI concepts;
UI sound: userinterface-wiki "Sounds on the web", Readymag, freeCodeCamp Web Audio, Josh Comeau "use-sound",
W3C SC 1.4.2, Deque no-autoplay-audio, htmlburger micro-interactions.

## 11. Before you ship any UI change

- [ ] Uses the patterns above (container, header, split, specimen, tokens, `Button`, title).
- [ ] Screenshots at 1280px and 375px, light and dark; no sideways scroll
      (`document.documentElement.scrollWidth === innerWidth`).
- [ ] Keyboard pass: every control reachable, visible focus, nothing hidden behind fixed bars.
- [ ] Lighthouse accessibility 100 (or each failure explained) on changed pages; contrast in both themes.
- [ ] Reduced motion: page reads correctly with animation off.
- [ ] Main action visible without scrolling on a phone.
- [ ] Production build passes (`npx next build`). The dev server sometimes serves a stale `globals.css`:
      `rm -rf .next` and restart, or check with the `prod` launch config.
- [ ] Big design change? Add a line to the Design log.

## Design log

Newest first. One entry per big design change: date, what changed, why, where.

- **2026-11-12: Accessibility pass (Lighthouse 100 on home, tutorial, login, accessibility).** Tutorial now
  greys out (`filter: grayscale(1)`) the parts not being explained instead of fading them, because fading broke
  text contrast. Home demo's not-yet-spoken words use plain `text-muted-foreground`. Cookie notice link is ink,
  not teal. "Skip to content" link (`components/skip-link.tsx`, target `id="main"` in `app/(app)/layout.tsx`).
  New `/accessibility` statement page, linked in the footer.

- **2026-11-12: Microphone check popup on Record.** Opens on page load; Skip or Test microphone, then a
  green check (the `AuthMessage` success green) pops in with the button spring and a soft tick once a voice
  is heard. Styled to the system: no backdrop blur (removed from the shared dialog, DESIGN.md bans glass),
  hairline frame, 48px buttons, house ease, literal "Done" instead of a "Start recording" that didn't record.
  Why: a muted mic wastes minutes of analysis. `components/record/mic-check.tsx`, `.pop-in` in
  `app/globals.css`, `components/ui/dialog.tsx`.
- **2026-11-12: Button spring and error shake** (from the "20 Principles of UX & Animation" reel). Main
  buttons squish and bounce back on press; top-bar icon buttons stay plain; error messages shake once.
  All off with reduced motion. `.press-spring` and `.shake` in `app/globals.css`,
  `components/ui/button.tsx`, `components/auth/auth-card.tsx`.
- **2026-11-12: Interface sounds.** Quiet synthesized "tap" on every button press, rising/falling two-note
  tones on Start/Stop recording, a soft "tick" on tutorial Back/Next and on the pace slider (pitch follows
  the pace). On by default, mute with the speaker button in the top bar. `components/ui-sounds.tsx`,
  `app/layout.tsx`, `components/site-nav.tsx`.
- **2026-11-12: Brand tab icon, 404 page, tab titles.** `app/icon.svg`, `app/(app)/not-found.tsx`,
  `app/not-found.tsx`, title template in `app/layout.tsx`.
- **2026-11-12: Sound rings behind "um".** Replaced the soft teal glow with three hairline teal rings that
  pulse out three times as the word lands, then stop. `.um-wave` in `app/globals.css`, `components/home/hero.tsx`.
- **2026-11-12: About page in the specimen style.** Giant teal "77%" stat, ruled 5/7 sections.
  `app/(app)/about/page.tsx`.
- **2026-11-11: Teal glow behind "um"** (from the "tactile" Instagram reel). Superseded by the rings above.
- **2026-11-11: Tutorial step bar and dimming** (from a UX-laws reel: connectedness, figure-ground).
  `components/tour.tsx`, `[data-tour]` rules in `app/globals.css`.
- **Earlier: Type-specimen redesign.** Giant "um", "3 filler words in 18 seconds.", pace slider that changes
  the sample speech's letter width. See `.impeccable/surfaces/app-app-page-tsx.md`.
