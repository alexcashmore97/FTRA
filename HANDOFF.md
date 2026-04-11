# HANDOFF - Agent Coordination

> Shared task board between two Claude agents (Pane A & Pane B).
> When you pick up a task, mark it `IN PROGRESS` with your pane ID.
> When done, mark it `DONE` and note any context the other agent needs.
> Add new tasks under the appropriate section.

## Convention
- **Status tags:** `TODO`, `IN PROGRESS [A/B]`, `BLOCKED [reason]`, `DONE`
- **Handoff:** When you finish something the other agent depends on, add a note under `## Handoff Notes` with what was done and any info they need.
- **Read before starting:** Always re-read this file before picking up work to avoid conflicts.

---

## App: Full Thai Rules Australia (FTRA) — Redesign

**Goal:** Redesign fullthairulesaustralia.com as a dark, cinematic Muay Thai ranking platform. Not a template — something that feels like fight night.

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | **React + Vite (SPA)** | Fast dev, TypeScript, simple setup |
| Database | **Firebase Firestore** | NoSQL as requested, real-time, free tier generous |
| Auth | **Firebase Auth** | Admin + fighter login, email/password |
| Styling | **Custom CSS** | Hand-crafted dark cinematic theme, full control |
| Animations | **Framer Motion** | Smooth page/card transitions, cinematic feel |
| Routing | **React Router** | Client-side SPA routing |
| Image Storage | **Firebase Storage** | Fighter photo uploads |
| Deploy | **Firebase Hosting** | Integrated with Firebase ecosystem |

---

## Data Model (Firestore)

### `fighters` collection
```
{
  id: string (auto),
  firstName: string,
  lastName: string,
  nickname: string,
  gym: string,
  state: string,          // e.g. "VIC", "NSW"
  division: string,       // e.g. "male-welterweight-66"
  weightClass: string,    // e.g. "Welterweight 66kg"
  gender: "male" | "female",
  rank: number | null,    // rank within division (null = unranked)
  p4pRank: number | null, // pound-for-pound rank (null = unranked)
  titleHolder: boolean,
  titleDate: string | null,
  bio: string,
  photoURL: string,
  record: string,         // e.g. "12-3-0"
  age: number | null,
  stance: string,         // e.g. "Orthodox"
  email: string,          // for fighter login (linked to Firebase Auth uid)
  uid: string | null,     // Firebase Auth uid
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### `divisions` collection
```
{
  id: string,             // e.g. "male-welterweight-66"
  name: string,           // e.g. "Welterweight"
  weight: string,         // e.g. "66kg"
  gender: "male" | "female",
  sortOrder: number       // for display ordering
}
```

### `admins` collection
```
{
  uid: string,            // Firebase Auth uid
  email: string,
  role: "admin"
}
```

---

## Current Sprint

| # | Task | Owner | Status | Notes |
|---|------|-------|--------|-------|
| 1 | Project scaffolding (React + Vite + Firebase + Framer Motion) | | DONE | React+Vite+TS scaffold, Firebase SDK, Framer Motion, React Router installed |
| 2 | Firebase project setup (Firestore, Auth, Storage, security rules) | B | DONE | Project `ftra-australia` created, web app configured, .env populated, Firestore + Storage rules deployed |
| 3 | Seed divisions data (all 24 divisions) | A | DONE | `src/lib/divisions.ts` — all 24 divisions with slugs |
| 4 | Landing page — hero, divisions grid, cinematic design | A | DONE | `src/pages/HomePage.tsx` — hero, stats bar, division grid with gender tabs |
| 5 | Division ranking page (`/rankings/:divisionId`) | A | DONE | `src/pages/DivisionRankingsPage.tsx` — champion + ranked list, division pill nav |
| 6 | Fighter profile page (`/fighters/:id`) | A | DONE | `src/pages/FighterProfilePage.tsx` — photo, stats grid, bio |
| 7 | P4P ranking page (`/rankings/p4p?gender=`) | A | DONE | `src/pages/P4PRankingsPage.tsx` — gender tabs, shows weight class per fighter |
| 8 | Admin auth (login page + route protection) | B | DONE | `AdminLoginPage`, `AdminRoute` guard, checks `admins` collection |
| 9 | Admin ranking manager UI | | TODO | Drag/drop or number input, auto-reorder logic |
| 10 | Fighter auth (login + route protection) | B | DONE | `FighterLoginPage`, `FighterRoute` guard, links uid to fighter doc, enforces own-profile-only |
| 11 | Fighter profile editor | | TODO | Edit 5-6 fields, upload photo, write bio |
| 12 | Nav + layout (header, footer, mobile menu) | A | DONE | `src/components/Header.tsx`, `Footer.tsx`, `Layout.tsx` — dropdown navs, mobile menu |
| 13 | Seed sample fighter data | A | DONE | `src/lib/mockFighters.ts` — 10 fighters across divisions |
| 14 | Contact page | A | DONE | `src/pages/ContactPage.tsx` — form with success state |

---

## Handoff Notes

*(latest first)*

- **[Pane A — 2026-04-11]** Organized all scraped assets into project structure:
  - `public/favicon.ico`, `favicon-32.png`, `apple-touch-icon.png` — real favicons from scraped site
  - `public/images/logos/ftra-logo.png` — FTRA circular logo (used in header + footer)
  - `public/images/logos/csi.png`, `wbc.avif` — partner logos (shown in footer)
  - `public/images/divisions/male/*.jpg` (12 files) — division hero images for male weight classes
  - `public/images/divisions/female/*.jpg` (12 files) — division hero images for female weight classes
  - `public/images/hero/ring-atmosphere.jpg` — overhead ring shot (hero background)
  - `public/images/hero/hero-fighter.png` — fighter in ring (available for future use)
  - `public/images/hero/featured-event.jpg` — winner photo (available for featured section)
  - `public/images/store-preview.webp` — merch preview (future use)
  - `src/data/fighter-data.json` — **REAL scraped fighter rankings** (~520 lines, all divisions, hundreds of fighters with names/gyms/titles)
  - Removed old Vite boilerplate SVGs (`react.svg`, `vite.svg`, `icons.svg`)
  - Updated `divisions.ts` to include `image` field per division
  - Updated `DivisionCard` — now shows division photo with dark gradient overlay
  - Updated `Header` — shows FTRA circular logo
  - Updated `Footer` — shows WBC + CSI partner logos
  - Updated `HomePage` hero — ring atmosphere photo as background
  - Updated `DivisionRankingsPage` — banner image at top of each division page
  - Updated `index.html` — real favicon references
- **[Pane A — 2026-04-11]** Built full frontend boilerplate. All public pages done with mock data:
  - **Router:** `App.tsx` wired with React Router — `/`, `/rankings/:divisionId`, `/rankings/p4p`, `/fighters/:id`, `/contact`
  - **Components:** `Header` (dropdown navs + mobile menu), `Footer`, `Layout` (Outlet wrapper), `RankingRow`, `DivisionCard`
  - **Pages:** `HomePage` (hero + stats + division grid), `DivisionRankingsPage`, `P4PRankingsPage`, `FighterProfilePage`, `ContactPage`
  - **Data:** `lib/divisions.ts` (all 24), `lib/types.ts`, `lib/mockFighters.ts` (10 sample fighters)
  - **Styles:** Custom CSS — `index.css` (globals/reset/vars), `header.css`, `hero.css`, `rankings.css`, `fighter.css`, `footer.css`
  - **Config:** Vite path alias `@/` added to `vite.config.ts` + `tsconfig.app.json`
  - **Removed:** Old Vite boilerplate `App.css`, deleted accidental `ftra-app/` folder
  - **Next:** Run `npm run dev` to test. Then admin auth + ranking manager UI.
- **[Pane B — 2026-04-11]** Installed toolchain: nvm, Node.js v24.14.1, npm v11.11.0, Firebase CLI v15.14.0. Scaffolded React+Vite+TypeScript project. Installed firebase, framer-motion, react-router-dom. Created `src/lib/firebase.ts` (Firestore/Auth/Storage init with env vars). Created `.env.example`. **Next step:** run `firebase login` interactively, then `firebase init` to connect a Firebase project and populate `.env`.
- **[Pane A]** Researched current site. It's Webflow, dark theme, red accents, 24 divisions (12M/12F). Fighter cards show: rank, name, division, gym, state, title status, title date. Designed full architecture above.

---

## Decisions Log

- **Stack:** React (Vite) + Firebase + Custom CSS + Framer Motion. NoSQL via Firestore.
- **Auth:** Two roles — admin (full ranking control) and fighter (edit own profile only).
- **Rankings:** Per-division + P4P. Admin changes a rank → all other ranks auto-shift.
- **Divisions:** 12 male, 12 female (mirroring current site).
- **Design direction:** Dark, cinematic, fight-night aesthetic. NOT a generic sports template. Think UFC-meets-editorial. Black/charcoal base, red + gold accents, dramatic typography.
- **Fighter editable fields:** nickname, gym, bio, photo, stance, record (exact list can be refined).

---

## Division Reference

### Male (12)
| Division | Weight | Slug |
|----------|--------|------|
| Super Bantamweight | 55kg | male-super-bantamweight-55 |
| Featherweight | 57kg | male-featherweight-57 |
| Super Featherweight | 58kg | male-super-featherweight-58 |
| Lightweight | 61kg | male-lightweight-61 |
| Super Lightweight | 63.5kg | male-super-lightweight-63 |
| Welterweight | 66kg | male-welterweight-66 |
| Super Welterweight | 70kg | male-super-welterweight-70 |
| Middleweight | 72kg | male-middleweight-72 |
| Super Middleweight | 76kg | male-super-middleweight-76 |
| Light Heavyweight | 79kg | male-light-heavyweight-79 |
| Cruiserweight | 90kg | male-cruiserweight-90 |
| Heavyweight | 91kg+ | male-heavyweight-91 |

### Female (12)
| Division | Weight | Slug |
|----------|--------|------|
| Minimum Weight | 45kg | female-minimum-weight-45 |
| Mini Flyweight | 47kg | female-mini-flyweight-47 |
| Light Flyweight | 49kg | female-light-flyweight-49 |
| Flyweight | 50kg | female-flyweight-50 |
| Super Flyweight | 52kg | female-super-flyweight-52 |
| Bantamweight | 53kg | female-bantamweight-53 |
| Super Bantamweight | 55kg | female-super-bantamweight-55 |
| Featherweight | 57kg | female-featherweight-57 |
| Super Featherweight | 59kg | female-super-featherweight-59 |
| Lightweight | 61kg | female-lightweight-61 |
| Super Lightweight | 63.5kg | female-super-lightweight-63 |
| Light Heavyweight | 79kg | female-light-heavyweight-79 |
