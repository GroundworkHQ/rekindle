# Rekindle — Reference (RETIRED 2026-07-27)

> **This document is retired. It does not describe the live product.**
> It documented an architecture Rekindle has since moved off of. Kept as a stub only so
> old links and old sessions land somewhere honest instead of on stale instructions.

## Where the live truth is

Rekindle ships from **`~/rekindlemarriage.com`** (repo `Ooak21/rekindlemarriage.com`, branch `main`).
Read that repo. This one (`GroundworkHQ/rekindle`) is the earlier dev/app version, not the site.

| | This retired doc claimed | Actually true |
|---|---|---|
| Canonical home | Vercel, `rekindle-ebon-mu.vercel.app`, "migration off GitHub Pages COMPLETE" | **GitHub Pages** + `CNAME`, after the DNS repoint back off Vercel (`1d4c8c8`) |
| This repo | canonical, auto-deploys on push | **not the live site** |
| Ember backend | Vercel Node functions in `api/` | **Supabase edge functions** on the shared IBS project `jtifhcvbgxqwlywugvjv`: `rekindle-ember-chat`, `rekindle-ember-token`, `rekindle-ember-tts`, `rekindle-ember-stt`, plus `rekindle-reserve` (`603d12b`) |
| Face of the brand | Dr. Peter DeBry | **Nellie Reedy** (DeBry fully scrubbed: `33ff8a0`, `2f70e71`) |

The Ember AI design notes that outlived the platform move (two-brain text/voice split, the
hardened safety prompt, the deterministic crisis safety net, the xAI voice-name gotcha, orb
envelope tuning) were preserved to memory as `reference_ember_ai_design` before this file was
retired. Nothing of value was dropped on the floor here.

**Do not plan work from this file.**
