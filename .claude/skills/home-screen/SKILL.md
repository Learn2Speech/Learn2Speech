---
name: home-screen
description: /home-screen — how to design and change the Learn2Speech home page (and other big marketing-style screens) so they stay great: research-backed hero rules, button feel and interface sound rules, our committed look, and a log of every big design change. Use before any home page or hero work, any big visual change, or when asked what makes a good home screen. After a big design change ships, add it to the Design log below.
---

# /home-screen

Read this before touching the home page (`app/(app)/page.tsx`, `components/home/*`) or making any big visual
change. It sits on top of `DESIGN.md` (the design system) and `PRODUCT.md` (who it's for); those win if they
disagree. If `/impeccable` is used, its own rules apply too.

## What makes a great home screen (research, Nov 2026)

1. **One job, one main action.** The first screen says what the product does in seconds and offers one
   primary button. Each extra button in the hero competes with it; a quiet secondary (our "Try the tutorial")
   is the most to add.
2. **The main action stays in the first viewport**, on phones too. Big visuals must never push it below the fold.
3. **Show the product, don't describe it.** The strongest voice/audio product pages put a live or animated demo
   in the hero (a waveform, a transcript typing out). Ours: the giant "um" plus the pace slider over a real
   sample speech.
4. **One authored motion moment, not scattered effects.** Kinetic type works when it is structural (it
   sequences the message), not decorative. Constant looping motion next to text is tiring; play once (or a
   few times) and stop.
5. **Restraint wins.** Award-level heroes pair a single hero object with a minimal background and one accent
   colour (ElevenLabs: one saturated accent for button, brand and waveform). Copy short and literal.
6. **Variable fonts are a cheap superpower.** Animating weight or width of one typeface gives motion with no
   images. Archivo has weight (100–900) and width (62–125%) axes; we use weight for the "um" entrance and
   width as data (pace).
7. **Fast and accessible.** Animate only `transform`/`opacity` (and font axes once), skip motion under
   `prefers-reduced-motion`, keep text contrast ≥ 4.5:1, test at 375px wide with no sideways scroll.

Sources: Muzli "Landing page design trends 2026"; raw.studio "Kinetic typography is redefining UX";
StudioMeyer "Kinetic typography"; Framer text-animation guide; Awwwards variable-font-animation collections;
Omniconvert "Hero section examples 2026"; saasui.design ElevenLabs pattern; Contra voice-AI landing concepts.
These are trend/vendor sources, not controlled studies; treat numbers in them as directional.

## Button feel and interface sound (research, Nov 2026)

Buttons:
- Feedback within 100 ms of the press; animate the control itself (press-in, label change such as
  "Working..."), not a separate toast. Scale the feedback to how big the action is.
- Press = scale to about 0.97 on `:active` over ~150 ms (our `Button` already does this). Disabled
  controls don't animate. A button that seems dead invites double presses.

Sound:
- Sounds should be felt more than heard: 30–150 ms, very quiet, only on meaningful actions (presses,
  slider moves, steps, start/stop). Never on hover, typing, scrolling or keyboard focus moves.
- Every sound sits on a visual change; nothing may depend on hearing it (accessibility).
- Always give a mute switch, remembered on the device. WCAG 1.4.2 only requires control for audio over
  3 s, but an off switch is the expected courtesy.
- Browsers only allow sound after a click/tap/key press, so nothing can play on page load (the "um" rings
  are silent on purpose).
- Synthesize short tones with the Web Audio API instead of shipping sound files: no downloads, no package,
  and many quick sounds can overlap without cutting each other off. Check on headphones too: what is fine on
  laptop speakers can be harsh in ears.
- Throttle anything that can fire fast (sliders): we tick at most every 50 ms and every 4 steps.

Our decision (product owner): sounds ON by default, kept subconscious and never overwhelming, with the
speaker button in the top bar to mute. Code: `components/ui-sounds.tsx` (one site-wide listener; a button
can pick `data-sound="start" | "stop" | "tick"`, everything else gets "tap").

Sources: raphaelsalaja userinterface-wiki "Sounds on the web"; Readymag "Sound on the web"; freeCodeCamp
"Web audio for the user interface"; Josh Comeau "use-sound"; W3C Understanding SC 1.4.2 Audio Control;
Deque axe no-autoplay-audio; htmlburger micro-interactions guide.

## Our committed look (do not drift)

- **Type specimen.** One giant teal word or number per screen (home: "um"), one typeface (Archivo).
- **50/30/20 colour.** Neutral ground; teal for big marks and blocks; orange ONLY for things you can press or
  drag (plus tiny filler marks). Never an orange background.
- **Flat.** Hairline rules, no shadows, no glass, no decorative gradients (the one gradient we tried behind
  "um" was replaced by hairline rings, see the log).
- **Motion.** One ease `cubic-bezier(0.23, 1, 0.32, 1)`; entrances 600ms, presses 150ms.

## Before you ship a home screen change

- [ ] Screenshot before and after at 1280px and 375px, light and dark.
- [ ] Main button visible without scrolling on a phone.
- [ ] No sideways scroll (`document.documentElement.scrollWidth === innerWidth`).
- [ ] Reduced motion: page still reads correctly with all animation off.
- [ ] Run `/impeccable` detect on the page; fix real contrast/line-length findings.
- [ ] The dev server sometimes serves a stale `globals.css`: if a CSS change doesn't show, `rm -rf .next`
      and restart, or check with `npx next build` + the `prod` launch config.
- [ ] Add a line to the Design log below.

## Design log

Newest first. One entry per big design change: date, what changed, why, where.

- **2026-11-12: Interface sounds.** Quiet synthesized "tap" on every button press, rising/falling two-note
  tones on Start/Stop recording, a soft "tick" on tutorial Back/Next and on the pace slider (pitch follows
  the pace). On by default, mute with the speaker button in the top bar. Why: user wanted subtle sound to
  make interactions feel smooth. `components/ui-sounds.tsx`, `app/layout.tsx`, `components/site-nav.tsx`.

- **2026-11-12: Sound rings behind "um".** Replaced the soft teal glow with three hairline teal rings that
  pulse out from the word three times as it lands, then stop. Why: user wanted a different style/animation;
  research says one authored, content-tied moment beats ambient decoration, and voice products use sound
  waves. Rings keep the page flat (DESIGN.md bans gradients). `.um-wave` in `app/globals.css`,
  `components/home/hero.tsx`.
- **2026-11-12: About page in the specimen style.** Giant teal "77%" stat, ruled 5/7 sections.
  `app/(app)/about/page.tsx`.
- **2026-11-11: Teal glow behind "um"** (from the "tactile" Instagram reel). Superseded by the rings above.
- **2026-11-11: Tutorial step bar and dimming** (from a UX-laws reel: connectedness, figure-ground).
  `components/tour.tsx`, `[data-tour]` rules in `app/globals.css`.
- **Earlier: Type-specimen redesign.** Giant "um", "3 filler words in 18 seconds.", pace slider that changes
  the sample speech's letter width. See `.impeccable/surfaces/app-app-page-tsx.md`.
