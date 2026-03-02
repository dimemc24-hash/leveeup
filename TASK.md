# LeveeUp — Full Build Task

## What This Is
A Progressive Web App that gamifies 2nd grade curriculum (Louisiana standards, Ascension Parish, Bullion Primary) through a Cryptid Hunt narrative. Students solve curriculum-aligned problems to progress through investigations, earning XP, unlocking clues, and discovering cryptids.

## Tech Stack
- React 18+ with TypeScript
- Tailwind CSS
- Zustand for state management
- Vite for build
- Workbox for PWA/offline
- **NO Supabase yet** — use local state + localStorage for all data persistence. Structure the data layer so Supabase can be wired in later (keep all DB operations in a `lib/storage.ts` abstraction layer).

## Architecture

### Project Structure
```
src/
  components/          — Shared UI components
  features/
    auth/              — Login, registration (mock for now)
    game/              — Core game loop, question engine, scoring
    themes/
      engine/          — ThemeProvider, ThemeContext, theme types
      cryptids/        — First theme implementation
      _template/       — Empty theme template for future themes
    shop/              — Avatar shop, inventory
    dashboard/         — Parent/teacher analytics
    progress/          — Clue board, investigation map, milestones
  lib/
    storage.ts         — Data abstraction layer (localStorage now, Supabase later)
    questions.ts       — Question loading, caching, adaptive selection
    scoring.ts         — XP calculation, streak tracking
  hooks/               — Custom React hooks
  types/               — TypeScript type definitions
  data/                — Knowledge base JSON + theme content
public/
  manifest.json
  assets/              — Theme assets (SVGs, images)
```

### Theme Engine
- ThemeProvider context wraps the app
- Each theme is a self-contained module exporting: narrative text templates, visual assets (colors, icons, backgrounds), reward definitions, progression narrative
- Core game engine is 100% theme-agnostic — only knows questions, answers, points, progression events
- The ThemeProvider translates events into themed experiences (e.g., "MILESTONE_REACHED: unit_3_complete" → "You found muddy footprints near the bayou!")

### Authentication (Mock)
- Simple profile selection screen (no real auth)
- User roles: STUDENT, PARENT, TEACHER
- Store profiles in localStorage
- Structure so Supabase Auth can replace later

### Game Loop
1. Home Screen: Current investigation status, daily streak, quick-play button
2. Subject Selection: Pick a subject or get recommended mix based on progress gaps
3. Question Flow: Themed narrative framing → answer → immediate feedback → XP → milestone check
4. Clue Board: Visual progress tracker — field journal that fills in as student progresses. Each investigation has 5-7 clue slots revealed as sketches, footprint casts, witness statements, map pins
5. Discovery Moments: Dramatic reveal animation when all clues found — cryptid card added to Field Guide collection
6. Shop: Spend XP on avatar cosmetics (hats, binoculars, vests, flashlights, journal covers, creature stickers)

### Adaptive Difficulty
- Track accuracy per standard per tier
- 3+ correct at tier → advance to next tier
- 2+ wrong at tier → drop back, offer scaffold/hint
- Struggling 5+ min in one subject → suggest switching ("The trail went cold here... let's check another lead!")
- Wrong answers still give partial XP (1 XP vs 5 XP for correct)
- Streak bonuses: 3 correct = 2x, 5 correct = 3x, 10 correct = 5x + special animation
- Frustration pivot: After 3 fails despite scaffolding, pivot to a "Field Mission" in another subject

### XP Economy
- Introductory: 10 XP, Developing: 25 XP, Mastery: 50 XP
- Streak multiplier: 1.5x at 5+, 2.0x at 10+
- 10 curriculum problems = 1 Evidence Piece, 5 Evidence Pieces = 1 Cryptid Location unlocked
- Daily login reward: 1 "Field Supply"
- Completing a Knowledge Domain → Legendary cryptid card

### Cryptid Theme (First Implementation)
- Narrative: Junior Cryptid Investigator recruited by mysterious field guide
- Cryptid roster (8): Honey Island Swamp Monster, Rougarou, Bigfoot, Mothman, Chupacabra, Jersey Devil, Thunderbird, Loch Ness Monster
- Visual: Field journal / explorer notebook. Earthy greens, browns, aged paper. Duolingo-level clean illustrations.
- Use simple, clean SVG illustrations — not excessive but polished. Think Duolingo's art style.
- Clue Board: Field journal filling in with sketches, footprints, witness statements, map pins
- Discovery: Dramatic reveal → trading card with stats → added to Field Guide
- Shop items: Explorer hats, binoculars, field vests, flashlights, journal covers, creature stickers

### Parent/Teacher Dashboard
- /dashboard route, role-gated
- Per-student: accuracy by subject (charts), standards mastery heatmap (green/yellow/red), time trends, streak/XP, struggle alerts (accuracy < 50% after 10+ attempts)
- Teacher adds: class averages, assign focus areas, export progress
- Simple and scannable — understand progress in 30 seconds

### PWA
- manifest.json with icons, theme color, display: standalone
- Workbox service worker for offline question caching
- Responsive: phones, tablets, Chromebooks
- Install prompt on first visit

### Accessibility
- ARIA labels on all interactive elements
- Tab navigation works
- WCAG AA color contrast

## Question Bank
Generate a FULL question bank with at minimum 8-10 questions per subject per tier (Introductory, Developing, Mastery) across all standards. That's roughly 100+ questions total. Use the curriculum data below as the source of truth for standards and content.

### Subjects & Standards

**Math (Eureka Math²):**
- Module 1: Sums & Differences to 100 (2.OA.A.1)
- Module 2: Length/Measurement (2.MD.A.1)
- Module 3: Place Value to 1,000 (2.NBT.A.1)
- Module 4: Addition/Subtraction within 200
- Module 5: Addition/Subtraction within 1,000
- Data & Graphs (2.MD.D.10)
- Key models: Tape diagrams, number bonds, place value disks

**ELA (CKLA/Wit & Wisdom):**
- Reading Literature key details (RL.2.1)
- Recounting stories & morals (RL.2.2)
- Contractions (L.2.2.c)
- Phonics progression (tricky words, digraphs, inflectional endings)
- Knowledge domains: Fairy Tales, Asian Civilizations, Greek Myths, War of 1812, Westward Expansion, etc.

**Science (Amplify):**
- Plant & Animal Relationships (2-LS2-2) — seed dispersal, habitats
- Properties of Materials (2-PS1-1) — observable properties, reversible/irreversible
- Changing Landforms (2-ESS2-1) — erosion, wind/water

**Social Studies (Bayou Bridges):**
- Geography & Maps (2.2.19) — compass rose, map key, scale
- Primary/Secondary Sources (2.2.2)
- Civics & Government (2.2.9) — three branches
- Economics — producers, consumers

Each question needs: id, standard_id, tier, question_type (multiple_choice, fill_in, sequencing, drag_and_drop), question text, options, correct_answer, explanation, distractor_rationale, and a theme_hook field for cryptid narrative framing.

### Theme Integration Hooks
- Math: "Solve this to decode the cryptid's coordinates"
- ELA: "Read this eyewitness report to find the clue"
- Science: "Act as a Geologist — is this cave natural erosion or a creature's den?"
- Social Studies: "Use the compass rose to track the Mothman's flight path"

### Cross-Subject Chains
Build at least 2 cross-subject chain sequences:
1. Math decode → Social Studies source analysis → ELA reading comprehension
2. Science observation → Math data/graphs → ELA writing about findings

## Visual Style
- Clean, Duolingo-inspired illustrations
- Field journal / explorer notebook aesthetic
- Earthy palette: greens, browns, aged paper textures
- SVG-based creature silhouettes and UI elements
- Celebratory animations for discoveries (can be CSS-based)
- The app should feel FUN and EXPLORATIVE, not like a test

## What to Deliver
- Complete, runnable codebase
- `npm install && npm run dev` should work
- README.md with setup instructions
- All question data embedded in src/data/
- All SVG assets in public/assets/

When completely finished, run this command to notify me:
openclaw system event --text "Done: LeveeUp V1 full build complete — runnable PWA with cryptid theme, 100+ questions, game loop, shop, dashboard, adaptive engine" --mode now
