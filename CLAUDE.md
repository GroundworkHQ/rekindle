# Rekindle — Claude Code context

## ⚠️ Read first: this is NOT the live Rekindle site

The live site is **`~/rekindlemarriage.com`** (repo `Ooak21/rekindlemarriage.com`, branch `main`,
GitHub Pages + `CNAME`). Do the work there, not here.

This repo (`GroundworkHQ/rekindle`) is the earlier dev/app version. Its `docs/REFERENCE.md` was
**retired 2026-07-27** because it documented a Vercel architecture the product has since moved
off of; see that stub for the correction table.

## What Rekindle is
Marriage coaching program, an IBS client. Dark ink / ember-orange brand, single-page site with a
Marriage Health Score quiz funnel and the **Ember AI** relationship guide (text + realtime voice).
**Nellie Reedy is the face of the brand** — she replaced Dr. Peter DeBry entirely in July 2026.

## Where things actually live now
- Site, `/bootcamp/`, `/crm/`, `score.html`: `~/rekindlemarriage.com`. Static, no build; push to
  `main` and Pages deploys.
- Ember backend: **Supabase edge functions** on the shared IBS project `jtifhcvbgxqwlywugvjv`
  (`rekindle-ember-chat`, `-token`, `-tts`, `-stt`, and `rekindle-reserve`). Not Vercel, not Convex.
- Ember design notes (two-brain split, safety net, voice gotchas): memory `reference_ember_ai_design`.

## Conventions & rules
- Secrets live in env vars only, never in code. Rotate immediately if exposed.
- Brand: dark ink background, ember orange accent. **No em dashes anywhere in copy.**
- Keep everything self-contained in `index.html` unless there's a reason to split.
- Rekindle commits credit **Miguel** as co-author. Never credit Claude.
- Don't auto-push; wait for explicit instruction.

## Current priority
<!-- What we're working on right now. -->
