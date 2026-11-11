---
name: Learn2Speech
description: A speech coach set like a type specimen: one giant word, plain ink, teal fields, orange for anything you can press.
colors:
  neutral-bg: "#F3F5F4"
  ink: "#0E1314"
  muted-ink: "#556062"
  line: "#D8DEDC"
  teal: "#0F5E68"
  teal-mark: "#1B8591"
  teal-foreground: "#E8F3F3"
  orange: "#C4521C"
  orange-foreground: "#FFFFFF"
  destructive: "#B3261E"
  dark-bg: "#0C0F10"
  dark-ink: "#E4EAE9"
  dark-teal: "#0D3A41"
  dark-teal-mark: "#4FB3BC"
  dark-orange: "#E8793F"
typography:
  specimen:
    fontFamily: "Archivo, sans-serif"
    fontSize: "clamp(11rem, 36vw, 31rem)"
    fontWeight: 900
    lineHeight: 0.62
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Archivo, sans-serif"
    fontSize: "3rem"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Archivo, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Archivo, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Archivo, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  sm: "4px"
  lg: "8px"
  full: "9999px"
spacing:
  gutter: "24px"
  block: "80px"
  block-lg: "112px"
components:
  button-primary:
    backgroundColor: "{colors.orange}"
    textColor: "{colors.orange-foreground}"
    rounded: "{rounded.lg}"
    height: "48px"
    padding: "0 24px"
  button-outline:
    backgroundColor: "{colors.neutral-bg}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    height: "48px"
    padding: "0 24px"
  teal-block:
    backgroundColor: "{colors.teal}"
    textColor: "{colors.teal-foreground}"
---

# Design System: Learn2Speech

## Overview

**Creative North Star: "Your voice as a typeface"**

Learn2Speech is laid out like a type foundry's specimen page. Each screen leads with one thing set very large (a filler word, a number) and lets plain ink on a quiet ground do the rest. The type itself carries the data: the example speech gets narrower when the pace goes up and wider when it slows, because the one typeface, Archivo, has a width axis.

The system is flat. There are no shadows, gradients or decorative cards; structure comes from hairline rules, generous space and big changes in type size. Color follows a 50/30/20 split the product owner asked for: about half neutral, teal for fields and big marks, and orange kept for things you can press or drag.

It has to work for a ninth grader and still look professional to an adult, so copy is short and literal, and every example is labeled as an example.

**Key Characteristics:**
- One giant word or number per screen, in teal.
- One typeface (Archivo), using weight and width for hierarchy and for data.
- Flat surfaces, hairline rules, no shadows.
- Orange means "you can press or drag this".
- Light and dark themes with the same roles.

## Colors

A cool neutral ground, one deep teal and one burnt orange, each with a fixed job.

### Primary
- **Action Orange** (#C4521C, dark theme #E8793F): buttons, the slider handle, the tutorial outline, the open/close marks in Questions, and the small filler-word marks in transcripts and timelines.

### Secondary
- **Specimen Teal** (#0F5E68, dark theme mark #4FB3BC): the giant word, large numerals, the waveform bars, and whole blocks (the demo on the home page, the timeline on results). On a teal block text is #E8F3F3.

### Neutral
- **Paper** (#F3F5F4, dark #0C0F10): the page.
- **Ink** (#0E1314, dark #E4EAE9): text and the strong rules that open a section.
- **Muted Ink** (#556062): secondary text.
- **Line** (#D8DEDC): hairline dividers and quiet borders.

### Named Rules
**The 50/30/20 Rule.** About half of any screen is neutral, about a third teal, and the rest orange. Orange is never a background field.

**The Press Rule.** If it is orange and bigger than a word, it can be pressed or dragged.

## Typography

**Display Font:** Archivo (variable: weight 100 to 900, width 62% to 125%), loaded with `next/font/google`
**Body Font:** Archivo
**Label/Mono Font:** system monospace, only for the time ruler under a timeline

**Character:** A sturdy grotesk that can go from hairline to black and from condensed to extended, so one family can be the headline, the body and the chart.

### Hierarchy
- **Specimen** (900, clamp(11rem, 36vw, 31rem) on desktop and 55vw on phones, line-height 0.62): the one giant word or number per screen. Sized from the word's letter count on results pages.
- **Headline** (600, 2.25rem to 3rem, line-height 1.02): page and section headings.
- **Title** (600, 1.25rem to 1.875rem): step names, question text, list headings.
- **Body** (400, 1.125rem, up to about 60ch): explanations.
- **Label** (500, 0.875rem): captions such as "Example", slider readouts, metadata.

### Named Rules
**The Width Is Data Rule.** `font-stretch` only changes to show pace. Never use condensed or extended type for style alone.

**The Thin Filler Rule.** A filler word inside large running text is set thin (weight 100) and orange; in small text it gets a soft orange highlight instead.

## Layout

A single 80rem (max-w-7xl) column with 24px side gutters on every page, including the top bar. Wide sections split 7/5 or 5/7: the big element on one side, the words on the other. Sections are separated by 80 to 112px of space or by a full-width ink rule. On phones everything stacks in reading order and the giant word spans the width.

## Elevation & Depth

No shadows anywhere. Depth comes from the teal blocks, the rules, and scale.

### Named Rules
**The Flat Rule.** Nothing floats. The only layer above the page is the tutorial bar and dialogs, and those use a rule or the dialog's own backdrop, not a shadow.

## Shapes

Small radii only: 4px on marks and highlights, 8px on buttons, teal blocks and example boxes, full rounding on waveform bars and the slider handle. Dividers are 1px; a section's opening rule uses ink instead of the line color.

## Components

### Buttons
- **Shape:** 8px radius, 48px tall for main actions.
- **Primary:** Action Orange with white text (dark theme: lighter orange with near-black text).
- **Outline:** page background, ink text, a 30% ink border. Used for the secondary action next to a primary.
- **Hover / Focus:** background eases 150ms; press scales to 0.97; focus shows a teal ring.

### Cards / Containers
- **Teal block:** full-bleed or 8px radius, teal background, light text, 24 to 40px padding. One per screen at most.
- **Example box:** 1px line border, 8px radius, 20 to 24px padding, with a small "Example" caption above.
- The older shadcn `Card` is still used on login and for the unfinished-recording notice.

### Inputs / Fields
- **File drop area:** 2px dashed border, 8px radius, turns teal on hover.
- **Pace slider:** a 2px ink track with a 28px round orange handle; the input itself is 44px tall.

### Navigation
- Solid page-colored bar, 56px tall, 1px bottom line, links in muted ink that turn ink on hover; the current page gets a soft neutral pill.

### Specimen (signature)
The giant teal word with a short headline beside it. It grows from hairline to black once when the page loads.

### Tutorial bar (signature)
A bar fixed to the bottom of `/demo` with the step count, a title, one sentence and Back/Next. The part being explained gets a 2px orange outline, 12px away from its edge.

### Motion
One ease, `cubic-bezier(0.23, 1, 0.32, 1)`. Entrances are 600ms; presses 150ms. Steps slide up as they scroll into view; the upload waiting bars loop. All of it is skipped or stilled under `prefers-reduced-motion`.

## Do's and Don'ts

### Do:
- **Do** lead each new screen with one very large teal word or number that comes from the data.
- **Do** keep orange for things that can be pressed or dragged, plus the small filler marks.
- **Do** label every made-up result as an example.
- **Do** check both themes; every color has a light and a dark value in `app/globals.css`.

### Don't:
- **Don't** add shadows, gradients or blurred glass.
- **Don't** use orange as a section background.
- **Don't** add testimonials, user counts or prices that are not real.
- **Don't** add a second typeface.
