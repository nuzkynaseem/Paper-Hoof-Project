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
- **More Works + interactive tilt cards + hero-less Work page (Jun 2026, verified iteration_6.json)**: New reusable `TiltCard` — rounded (20px) project frame with a cursor-following 3D "pull forward" tilt (imperative `style.transform` perspective/rotateX/rotateY/scale on mousemove, reset on leave; disabled on touch). New `MoreWorks` homepage section below the Featured project: a top-right "More Works" button (→ /work) above a 2x2 grid of 4 projects (odera/yaloo/woodland-publishing/burrowed). `Work` page rebuilt to a hero-less two-per-row `tilt-grid` of all 6 projects. Shared `.tilt-grid` in TiltCard.css.
- **Case study left sidebar (Jun 2026, verified iteration_5.json)**: New `ProjectSidebar` on `/work/:slug` — narrow fixed left rail with 6 round project cover-icons stacked vertically. The active project is linked to the screen by a gooey orange "blob" (SVG goo filter `#sidebarGoo`, position tracked via measured `blobTop`). Hovering expands the rail (72→300px); icons morph into rectangle cover cards with the project name; the list scrolls vertically. Clicking a project navigates to `/work/<slug>` (instant switch, blob moves). Case study page is now fully data-driven via `slugify(name)` (added `slugify` export in mock.js); prev/next by index; sticky "About the project" drawer preserved. Sidebar hidden under 768px; case-study content gets a 72px left gutter on desktop.
- **Homepage intro + featured (Jun 2026, verified iteration_4.json)**: Added `IntroReveal` component below the hero — a 220vh sticky section whose paragraph ("We are here to design for you...") reveals word-by-word tied to scroll progress (rAF-throttled scroll → per-word opacity). Converted `RecentProjects` to a SINGLE featured project card (projects[0] "Burger Hot") with category tags top-left and a Mane Orange "Featured Work" badge top-right of the 16:9 frame; removed the "Recent Projects" heading. Featured title uses Anton display; click navigates to the case study.
- **Hero/Navbar/Scrollbar changes (Jun 2026, verified iteration_3.json)**: Removed the "We Design Everything" pill entirely (homepage + footer dock + expansion modal; DesignCategories no longer used). Navbar now shows a "Work" link that fades in once the user scrolls (>20px). Hero scroll cue reduced to a single line+chevron arrow (no circle, no dots, no "See Selected Projects" text) with an up/down bob animation. Added a custom glassmorphism scrollbar that is hidden when idle and appears while scrolling (toggles `is-scrolling` class on <html>, 700ms debounce, in App.js + globals.css).
- **PENDING — Footer editorial redesign** (light Sheep White 3-column architectural layout, 520px desktop, large black horse bottom-left, stacked "Paper Hoof" wordmark centre, contact column right, column reveal animations). User provided a detailed spec + reference image; NOT yet implemented (superseded by the hero/navbar/scrollbar requests). Footer is currently still the dark Saddle Green layout minus the removed pill.
- Rebrand remaining surfaces: Brand Review form/page, Project Case Study page, Hamburger menu.
- P1 image uploads, P2 full backend integration (replace mock.js).
- **Typography + logo (Jun 2026)**: Navbar now uses the real horizontal "PAPER HOOF" wordmark (`/public/paperhoof-wordmark.svg`, viewBox cropped to artwork). Fonts switched to **Anton** (display/headings, via --font-heading) + **Overpass** (body/interface, via --font-primary) loaded from Google Fonts in index.css; hero italic subtitle uses Overpass italic. Scrolled navbar pill restyled to match the "We Design Everything" button (solid Sheep White, 1px rgba(32,36,35,0.12) border, radius-lg, 0 6px 16px rgba(0,0,0,0.06) shadow). NOTE: original spec requested Deutshlander+Passthrough; user opted for Overpass + a bold font (Anton) instead.
- **Recent Projects redesign** (Jun 2026, verified iteration_2.json): Pentagram-style editorial grid in RecentProjects.jsx/.css using `rp-` prefixed classes (scoped to avoid clashing with Work page's `.project-*`). Asymmetric 12-col grid (7/5, 5/7, 6/6 rhythm) → 8-col tablet → single-column mobile; sharp-cornered media (border-radius 0) with varied aspect ratios (16:10, 1:1, 4:3); Wolff-Olins pill tags INSIDE image top-left; title (Inter 500, 32/26/22) + muted description (rgba(32,36,35,0.68)) below; header with thin divider; IntersectionObserver staggered fade-in (opacity/translateY, 80ms stagger); lazy-loaded images. Added `description` field to each project in mock.js.
- Rebrand remaining surfaces: Brand Review form/page, Project Case Study page, Hamburger menu.
- Optional: unify inner-page hero color (Saddle Green) vs homepage hero (Navy).
- P1 image uploads, P2 full backend integration (replace mock.js).
