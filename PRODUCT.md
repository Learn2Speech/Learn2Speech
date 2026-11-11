# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primarily high school students practicing a speech: class presentations, and the competitive
speakers among them (debate, Model UN, speech and debate). Adults with a speech coming up are
welcome too, so the product must read as professional, not childish.

## Product Purpose

Learn2Speech is a speech coaching web app built for the 2026 Congressional App Challenge. You
upload a recording of yourself speaking and get your transcript, your pace in words per minute,
your filler words and long pauses, and short written coaching feedback. Success: a speaker
leaves knowing the top few things to fix before the real speech.

## Positioning

It measures the delivery, not the script: every filler word and every pause longer than one
second is placed where it happened in the recording, next to the pace.

## Operating Context

Record a run-through on a phone or laptop, upload the file (mp3, wav or m4a, up to 50 MB),
read the results, practice again. Past recordings stay in History.

## Capabilities and Constraints

- Sign up / log in with email and password; Upload and History need an account.
- Metrics computed by our own code: words per minute, filler words, pauses over 1 second, each with a rating.
- Coaching feedback (summary, what went well, what to work on) is written by Claude.
- Recordings are private to the account (Supabase Row Level Security).
- Judges use the live app: no Supabase changes, PRs into main only.
- No pricing, customers, testimonials or usage numbers exist; none may be invented.

## Brand Commitments

- The name Learn2Speech is fixed.
- The speech-bubble logo mark stays unless a clearly better idea is proposed and approved.
- Teal and orange stay only if they fit the new look; otherwise they may change.
- The site must look like a graphic designer made it, not like AI output: memorable and polished,
  minimal but eye catching.

## Evidence on Hand

- A sample result (an 18-second practice run about sleep) in `components/home/sample-result.ts`, used for the home demo.
- The live app at https://learn2speech.vercel.app.

## Product Principles

1. Show the speech, don't describe the product.
2. A few numbers a student can act on beat a dashboard.
3. Serious enough for an adult, clear enough for a ninth grader.
4. Privacy is a promise, stated plainly.
