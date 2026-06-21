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
- **Hero section redesign** (Hero.jsx/.css): full-viewport navy (#0D2E4A) hero, min-height 100vh/70vh/60vh (desktop/tablet/mobile), centered rotating project typography (Sheep White), Mane Orange active carousel dots, ScrollIndicator now lives inside hero bottom.
- **Navbar logo** replaced with `/public/paperhoof-logo.svg` (40/36/32px). Navbar gets light "hero mode" (white logo via filter + Sheep White nav text) on homepage top; reverts to dark cream pill when scrolled.
- **"We Design Everything" button** (DesignCategories): Sheep White bg, Horse Black text, Mane Orange dot + arrow, 1px rgba(32,36,35,0.12) border, soft shadow; positioned below navbar, left-aligned to 1200px content container.
- ScrollIndicator arrow recolored Saddle Green, text Sheep White.

## Known Caveats / Pending Confirmation
- **Logo mismatch**: attached `logo ex (1).svg` is icon-only (single horse path, no "Paper Hoof" wordmark). User referenced a "wordmark horizontal with logo.svg" — correct horizontal lockup file likely needed.
- **Scroll arrow contrast**: Saddle Green (#01360A) on navy (#0D2E4A) is very low contrast / nearly invisible. Implemented per spec but flagged.

## Backlog
- Rebrand remaining pages/sections to Paper Hoof palette (top-to-bottom refinement requested).
- P1 image uploads, P2 full backend integration (replace mock.js).
