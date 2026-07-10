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
- Secrets: `ANTHROPIC_API_KEY` (chat), `XAI_API_KEY` (Grok voice — TTS + STT). Local dev in gitignored `.env.local`; prod in Vercel env vars. ElevenLabs was fully replaced by xAI (2026-07-09); `ELEVENLABS_API_KEY` is dead and can be removed from Vercel.

## 3. Architecture

### Landing page (`index.html`)
Single HTML document. Sections top to bottom: hero (single CTA → `score.html`), truth, objections, Ember AI (`#ember-ai`, scripted demo window), process (`#how`), testimonial, physician bio (`#physician`), Marriage Score promo card, CTA (`#cta`). Hero CTA copy: "See What's Still There · 2 min".

### Marriage Health Score (`score.html`)
10-question quiz, 5 pillars, animated score ring, gated breakdown. Cormorant Garamond, centered. "Talk to Ember" button hands off to the landing page with `?score=X&focus=Y&chat=1`, which auto-opens the live Ember modal seeded with the score.
- **Lead capture NOT wired** (deliberate): HubSpot stripped; `unlock()` only `console.log`s leads. Wire to Miguel's custom CRM (Supabase + Resend) when ready.

### Ember AI (hybrid: Claude text brain + Grok realtime voice)
Embedded landing window (`#emberChatBody`) shows a scripted `chatMessages` preview. "Try Ember Free" opens the live modal (`#emberModal`). **Two brains by design (decided 2026-07-10 after a head-to-head):** typed text runs on Claude; hands-free voice runs on xAI's realtime Grok voice agent. Claude is warmer + safer on crisis/abuse but text-only, so it can't be the brain of a low-latency speech-to-speech loop; Grok's realtime agent is fast and natural but needed hardened rails + a code safety net (see below).

- **`api/ember-chat.js`** (TEXT brain) — Claude `claude-haiku-4-5` (from `claude-sonnet-5` for speed; quality held since warmth lives in the prompt — revert is one line), `thinking: disabled`, system prompt cached via `cache_control` ephemeral, streams via `res.write`, strips leading assistant turns, folds quiz score/focus in. NOTE: Haiku rejects `output_config.effort` — do not re-add.
- **`api/ember-realtime-token.js`** (VOICE) — mints a short-lived xAI ephemeral token (`POST https://api.x.ai/v1/realtime/client_secrets`, `expires_after` 600s) server-side so the real key never hits the browser. Returns `{token, voice: "Carina", instructions: EMBER_SYSTEM_PROMPT}` (prompt stays single-sourced).
- **`api/_ember-prompt.js`** — `EMBER_SYSTEM_PROMPT`, shared by both brains. HARDENED safety section (2026-07-10): forces 988 on any hint of self-harm/suicide and the DV hotline (1-800-799-7233) on abuse/intimidation incl. throwing/breaking things + fear/hiding, while explicitly NOT over-firing on ordinary sadness/venting. Bans dashes + discussing meds. Grok needed this hardening; Claude passed unhardened.
- **`api/ember-voice.js`** (Grok TTS, `POST /v1/tts`, voice `Carina`) + **`api/ember-transcribe.js`** (Grok STT, `POST /v1/stt`) — the OLD record→transcribe→chat→speak pipeline. ember-voice is still used for the text-mode speaker readback toggle; ember-transcribe + the old hands-free client code are now DEAD (mic button repointed to realtime) but kept as reference/fallback. NOTE: Grok voice names come from the console Voice Library (Carina, Ara, Celeste, Eve…), case-sensitive; the public docs' lowercase names are WRONG and an invalid voice_id returns a misleading "Incorrect API key" error.

**Realtime voice mode** (in the modal JS IIFE, `startRealtime`/`stopRealtime`/`rtOnEvent`): tapping the mic opens a hands-free orb view over the modal (dark ink bg, captions toggle off by default, top-right X returns to text).
- **Transport**: browser → `wss://api.x.ai/v1/realtime?model=grok-voice-latest`, auth via subprotocol `["xai-client-secret." + token]`. `session.update` sets voice=Carina, instructions, `server_vad` (native turn-taking + barge-in), PCM16 24k in/out, input transcription on. Mic captured via ScriptProcessor → PCM16 24k base64 → `input_audio_buffer.append`; her `response.output_audio.delta` chunks played gaplessly via scheduled AudioBufferSources.
- **SAFETY NET** (`rtCheckSafety`): watches the user's live transcript (`conversation.item.input_audio_transcription.*`); on explicit crisis/abuse regex match it flushes Grok's audio and `conversation.item.create` `force_message` makes Ember speak the exact 988 / DV-hotline line, bypassing the model. Belt-and-suspenders over the hardened prompt (Grok has a residual blind spot on intimidation-style abuse). Regex tuned to catch explicit self-harm/abuse and skip divorce/venting false positives.
- **Orb reactivity**: both sides drive `--orb-level` from a fine ~43ms-window loudness envelope (noise floor 0.006). Your mic uses gain 12; HER side is dialed calmer (gain 9 + heavier smoothing 0.7/0.3 in `rtVisFrame`) because her synth audio has sharper transients than the noise-suppressed mic and read too twitchy otherwise. `rtEnv` timeline is keyed to playback time; `rtVisFrame` reads the current window. Caption em-dashes sanitized (Grok slips them despite the rule).
- **History continuity**: starting voice mid-thread seeds the Grok session with the prior turns (`conversation.item.create` per `history` entry) and she continues instead of re-greeting; voice turns (incl. the forced safety line) are committed back into `history` so text↔voice keeps context both ways.
- **Latency**: realtime speech-to-speech, far below the old ~4s text-pipeline floor. The old text pipeline's parked streaming-STT idea is now moot for voice.

## 4. What's built
- Full landing page + Marriage Health Score funnel, live on Vercel.
- Ember AI fully live: Claude text chat + Grok realtime speech-to-speech voice (orb view, native barge-in, hardened rails + deterministic safety net, text↔voice history continuity). Safety net confirmed firing on-device.
- Hero images compressed.

## 5. What's next / launch blockers
- **ROTATE the Anthropic key** — it was exposed in chat during dev. (The xAI key is added fresh, never pasted in chat; ElevenLabs is dropped.) Then add rate limiting to `api/ember-chat.js` AND `api/ember-realtime-token.js` (voice minutes cost real money, ~$3/hr).
- Wire Marriage Score lead capture to Miguel's custom CRM (currently `console.log` only).
- Decide canonical home (Vercel vs rekindlemarriage.com) and point the real domain at the newest build.
- Optional cleanup: remove the dead old hands-free client code + `api/ember-transcribe.js` once realtime is proven in the wild.

## 6. Conventions
- Dark ink background, ember-orange accent. No em dashes anywhere in copy.
- Keep everything self-contained in `index.html` unless there's a reason to split; API logic lives in `api/`.
- Secrets in env vars only. Commit messages end with the Co-Authored-By line. Don't auto-push — wait for explicit instruction.
- Mobile reviewed 2026-07-10 at 390px: hero (hamburger nav), Ember orb voice view, and testimonial all good. Testimonial was left-clustered on mobile → now centered/balanced (media query at the `.testimonial` block). Rest of the page not yet swept in depth.

## 7. Open decisions
- **Canonical home MIGRATION IN PROGRESS (2026-07-10):** moving rekindlemarriage.com from GitHub Pages (Ooak21) to the Vercel `rekindle` project. Can't stay on Pages — the serverless `/api/ember-*` functions require Vercel. Both apex + www added to the Vercel project. Pending: GoDaddy DNS (apex `@` A → `76.76.21.21`; `www` CNAME → `cname.vercel-dns.com`), then remove the custom domain from the Ooak21 Pages settings. Vercel auto-issues SSL after propagation.
- Whether Ember AI stays inline or becomes a shared widget across IBS clients.
- Whether Ember gets its own distinct ElevenLabs voice (currently shares Grace's).
