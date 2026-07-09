# Rekindle — Reference

> Source-of-truth reference for Rekindle. Keep it current; `CLAUDE.md` points every new session here.

## 1. Overview
Marketing landing page for Rekindle, Dr. Peter DeBry's marriage coaching program. IBS client. Goal is to convert visitors into coaching leads, with an Ember AI chat widget as an interactive engagement point.

## 2. Stack & accounts
- Static single-file site — `index.html`, inline CSS/JS, no framework, no build.
- Local assets: `hero.mp4`, `couple-distance.jpg`, `couple-truth.jpg`, `debry.jpg`, logos, icon.
- Hosting: TBD (not yet deployed to a real domain — fill in when live).

## 3. Architecture
Single HTML document. Sections top to bottom: hero, truth, objections, Ember AI (`#ember-ai`), process (`#how`), testimonial, physician bio (`#physician`), CTA (`#cta`). Reveal-on-scroll animations via `.reveal` classes.

## 4. What's built
- Full one-page layout with all sections and assets in place (as of Jun 24).
- Ember AI chat section present in markup.

## 5. What's next
- Confirm Ember AI chat widget is wired to a real backend (currently just markup — verify).
- Contact/CTA form backend.
- Deploy to a real domain.

## 6. Conventions
- Dark ink background, ember-orange accent.
- Keep it self-contained in `index.html` unless there's a reason to split.

## 7. Open decisions
- Hosting target (GitHub Pages vs apex-site flow vs Vercel).
- Whether Ember AI stays inline or becomes a shared widget across IBS clients.
