# Rekindle — Claude Code context

## Read first
Before working, read **`docs/REFERENCE.md`** — the source of truth for this project. This file is just the quick orientation.

## What this is
Landing page for Rekindle, Dr. Peter DeBry's marriage coaching program (an IBS client). Single-page site with a dark ink / ember-orange look and an Ember AI chat section.

## Stack
- Static single-file site: `index.html` (~52KB, all inline CSS/JS) plus local assets.
- Assets: `hero.mp4`, `couple-distance.jpg`, `couple-truth.jpg`, `debry.jpg`, `rekindle-logo.png/.jpg`, `rekindle-icon.png`.
- No build step, no framework. Preview by opening the file / serving the folder locally.

## Page structure (sections in `index.html`)
hero → truth → objections → Ember AI (`#ember-ai`) → process (`#how`) → testimonial → physician bio (`#physician`) → CTA (`#cta`).

## Conventions & rules
- Secrets live in env vars only, never in code. Rotate immediately if exposed.
- Commit + push at the end of each session to back up. Commit messages end with the Co-Authored-By line.
- Keep everything self-contained in `index.html` unless there's a reason to split.
- Brand: dark ink background, ember orange accent.

## Current priority
<!-- What we're working on right now. -->
