# LeveeUp — Cryptid Hunt

A Progressive Web App that gamifies 2nd grade curriculum (Louisiana standards, Ascension Parish, Bullion Primary) through a Cryptid Hunt narrative.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Features

- **Gamified Learning**: Students solve curriculum-aligned problems to progress through cryptid investigations
- **4 Subjects**: Math, ELA, Science, Social Studies — 120+ questions across all Louisiana standards
- **Adaptive Difficulty**: 3 tiers (Introductory, Developing, Mastery) that adjust based on performance
- **Cryptid Hunt Theme**: 8 cryptids to discover through evidence collection
- **XP & Streaks**: Earn XP, maintain streaks, unlock cryptid locations
- **Shop System**: Spend XP on explorer gear (hats, binoculars, vests, flashlights, journals, stickers)
- **Parent/Teacher Dashboard**: Monitor student progress, accuracy by subject, struggle alerts
- **PWA**: Installable, works offline on phones, tablets, and Chromebooks
- **Accessible**: ARIA labels, keyboard navigation, WCAG AA contrast

## Tech Stack

- React 18+ with TypeScript
- Tailwind CSS v4
- Zustand for state management
- Vite for build
- vite-plugin-pwa for offline/PWA support

## Project Structure

```
src/
  components/        — Shared UI (Layout, navigation)
  features/
    auth/            — Profile selection (mock auth)
    game/            — Game loop, question flow, results
    themes/engine/   — ThemeProvider context
    themes/cryptids/ — Cryptid Hunt theme content
    shop/            — Avatar shop, inventory
    dashboard/       — Parent/teacher analytics
    progress/        — Clue board, field guide
  lib/
    storage.ts       — localStorage abstraction (Supabase-ready)
    questions.ts     — Adaptive question selection engine
    scoring.ts       — XP calculation, streaks, milestones
  hooks/             — Zustand game store
  types/             — TypeScript type definitions
  data/              — Question bank, shop items, chains
public/assets/       — SVG assets (cryptids, UI, shop items)
```

## Data Persistence

All data is stored in localStorage via `src/lib/storage.ts`. The abstraction layer is designed so Supabase can be wired in later without touching the rest of the app.
