# Paper Hoof (formerly Branfern) — Product Notes

## Overview
Premium editorial-style landing site for a branding agency. React frontend, custom CSS + Tailwind. Backend (FastAPI + MongoDB) provisioned but unused. All content mocked in `/app/frontend/src/mock.js`.

## Rebrand: Branfern → Paper Hoof
New "Paper Hoof" color system introduced (added to `styles/globals.css` :root):
- Sheep White `#FFFDF7` (--sheep-white)
- Horse Black `#202423` (--horse-black)
- Mane Orange `#E34C18` (--mane-orange)
- Saddle Green `#01360A` (--saddle-green)
- Hero Navy `#0D2E4A` (--hero-navy)
Older Branfern vars (--bg-cream, --primary-green, etc.) still in use elsewhere — rebrand is in progress, page by page.

## Implemented (Jun 2026)
- **Hero section redesign** (Hero.jsx/.css): full-viewport navy (#0D2E4A) hero, min-height 100vh/70vh/60vh, centered rotating project typography (Sheep White), Mane Orange active carousel dots, ScrollIndicator inside hero bottom with a frosted-glass arrow (legible over navy + future video).
- **Navbar logo** = `/public/paperhoof-logo.svg` (40/36/32px), light "hero mode" only on homepage top (navy hero); dark elsewhere (inner pages have a Sheep White strip above their hero, so dark navbar is correct there).
- **"We Design Everything" button**: Sheep White bg, Horse Black text, Mane Orange dot/arrow, positioned below navbar, left-aligned to 1200px container.
- **Top-to-bottom rebrand to Paper Hoof palette** (Jun 2026): remapped global tokens in globals.css (--bg-cream→#FFFDF7, --primary-green→#01360A Saddle Green, --black→#202423 Horse Black). Targeted Mane Orange accents on: footer docked rectangle, About card-bullet + carousel dots, Contact CTA, DesignCategories expansion modal active state. Footer rebranded: Saddle Green bg, "Paper Hoof" wordmark, white horse brand-mark, orange docked rectangle. All visible "Branfern" text → "Paper Hoof"; placeholder email → hello@paperhoof.com.
- Verified by testing agent (iteration_1.json): all routes 100% pass, 0 console errors, no leftover Branfern text, modal/drawer/footer/hamburger all functional.

## Known Caveats / Pending Confirmation
- **Logo mismatch**: attached `logo ex (1).svg` is icon-only (single horse path, no "Paper Hoof" wordmark). User may want to re-upload the horizontal wordmark+logo lockup.
- Placeholder email set to hello@paperhoof.com (was branfern@gmail.com) — confirm real address.

## Backlog
- Rebrand remaining pages/sections to Paper Hoof palette (top-to-bottom refinement requested).
- P1 image uploads, P2 full backend integration (replace mock.js).
