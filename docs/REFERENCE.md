# Rekindle — Reference

> Source-of-truth reference for Rekindle. Keep it current; `CLAUDE.md` points every new session here.

## 1. Overview
Marketing landing page for Rekindle, Dr. Peter DeBry's marriage coaching program (IBS client). Goal is to convert visitors into coaching leads. Two interactive hooks drive engagement: a **Marriage Health Score** quiz funnel and a live **Ember AI** relationship-guide chat (text + voice).

## 2. Stack & accounts
- Static site — `index.html` + `score.html`, inline CSS/JS, no framework, no build.
- Serverless API — Vercel Node functions in `api/` (NOT Edge; the Anthropic SDK needs Node built-ins). `package.json` has `@anthropic-ai/sdk`, `type: module`.
- Local assets: `hero.mp4`, `couple-distance.jpg`, `couple-truth.jpg`, `debry.jpg`, `rekindle-logo.*`, `rekindle-icon.png`.
- Hosting: **Vercel** — repo `GroundworkHQ/rekindle` auto-deploys to **rekindle-ebon-mu.vercel.app** on push to `main`.
- Rekindle's real branded domain **rekindlemarriage.com** (`Ooak21/rekindlemarriage.com`, GitHub Pages) runs an OLDER build. Canonical-home decision still open (see §7).
- Secrets: `ANTHROPIC_API_KEY`, `ELEVENLABS_API_KEY`. Local dev in gitignored `.env.local`; prod in Vercel env vars. ElevenLabs reuses the Gateway/Grace account.

## 3. Architecture

### Landing page (`index.html`)
Single HTML document. Sections top to bottom: hero (single CTA → `score.html`), truth, objections, Ember AI (`#ember-ai`, scripted demo window), process (`#how`), testimonial, physician bio (`#physician`), Marriage Score promo card, CTA (`#cta`). Hero CTA copy: "See What's Still There · 2 min".

### Marriage Health Score (`score.html`)
10-question quiz, 5 pillars, animated score ring, gated breakdown. Cormorant Garamond, centered. "Talk to Ember" button hands off to the landing page with `?score=X&focus=Y&chat=1`, which auto-opens the live Ember modal seeded with the score.
- **Lead capture NOT wired** (deliberate): HubSpot stripped; `unlock()` only `console.log`s leads. Wire to Miguel's custom CRM (Supabase + Resend) when ready.

### Ember AI (live chat + voice)
Embedded landing window (`#emberChatBody`) shows a scripted `chatMessages` preview. "Try Ember Free" opens the live modal (`#emberModal`).
- **`api/ember-chat.js`** — Claude `claude-sonnet-5`, `thinking: disabled` + `output_config.effort: low` for speed, streams text via `res.write`. Strips leading assistant turns (Claude needs a user-first message). Folds quiz score/focus into the system prompt.
- **`api/_ember-prompt.js`** — `EMBER_SYSTEM_PROMPT`: warm relationship guide, short replies, guardrails (not a therapist/doctor, crisis → 988), nudge to book a call, bans dashes.
- **`api/ember-voice.js`** — ElevenLabs TTS, `eleven_flash_v2_5`, voice `RSUcZp3ilp3WUZWLUwcY`. Returns `audio/mpeg`.
- **`api/ember-transcribe.js`** — ElevenLabs Scribe STT (`scribe_v1`); receives base64 mic audio. Replaced the flaky Web Speech API.

**Voice mode UX** (in the modal JS IIFE): tapping the mic enters a hands-free "orb view" — a pure glowing ember orb takes over the modal (dark ink bg, reacts to your mic level, breathes/pulses by listening/thinking/speaking state). Captions toggle (off by default), top-right X returns to the text chat.
- **Hands-free loop**: `getUserMedia` with echo cancellation → MediaRecorder per turn → Web Audio AnalyserNode VAD auto-ends your turn after `SILENCE_MS` quiet → transcribe → chat → speak → listen again.
- **Streaming speech**: replies are spoken sentence-by-sentence as they stream (audio fetched ahead of playback) so she starts talking after the first sentence.
- **Barge-in** (two ways): talk over her (adaptive echo-floor trigger cuts her off + aborts the reply) OR tap the orb to interrupt by hand. Both confirmed working on device.

## 4. What's built
- Full landing page + Marriage Health Score funnel, live on Vercel.
- Ember AI fully live: streaming text chat, TTS voice, STT, hands-free orb conversation with barge-in.
- Hero images compressed.

## 5. What's next / launch blockers
- **ROTATE both API keys** (Anthropic + ElevenLabs) — they were exposed in chat during dev. Then add rate limiting to `api/ember-chat.js`.
- Wire Marriage Score lead capture to Miguel's custom CRM (currently `console.log` only).
- Decide canonical home (Vercel vs rekindlemarriage.com) and point the real domain at the newest build.

## 6. Conventions
- Dark ink background, ember-orange accent. No em dashes anywhere in copy.
- Keep everything self-contained in `index.html` unless there's a reason to split; API logic lives in `api/`.
- Secrets in env vars only. Commit messages end with the Co-Authored-By line. Don't auto-push — wait for explicit instruction.

## 7. Open decisions
- Canonical home: newest work is on Vercel/GroundworkHQ; the branded domain rekindlemarriage.com runs an older build.
- Whether Ember AI stays inline or becomes a shared widget across IBS clients.
- Whether Ember gets its own distinct ElevenLabs voice (currently shares Grace's).
