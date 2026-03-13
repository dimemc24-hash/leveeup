# Cryptid Spell Caster — Design

**Date:** 2025-03-12  
**Source:** FreddyAudioUpdate.txt + voice requirement (less robotic, clear, slightly monster-like, not scary)

---

## 1. What We're Building

A **spelling practice module** inside LeveeUp that matches how Freddy is tested: **hear the word → write it with a stylus → get feedback**. It closes the gap between “unscrambling words” (visual) and “hear and write” (auditory-to-written).

**Flow:** App speaks a word → child writes on a canvas (stylus/touch) → canvas image is sent to an API for handwriting recognition → result is compared to the target word → correct: cryptid reveal; wrong: show what they wrote vs. correct + spelling tip + try again.

**Voice requirement (added):** The voice should be **less robotic, very clear, and sound slightly like a monster (but not scary)**.

---

## 2. Architecture Overview

| Layer | Responsibility |
|-------|----------------|
| **Frontend** | React (existing app), new feature route: word-pack menu → play screen (TTS + canvas + buttons) → result screen. Uses existing Supabase client and env (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY). |
| **Speech** | TTS: see Voice/TTS section below. |
| **Handwriting** | HTML Canvas with Pointer Events (stylus/touch/mouse), pressure-sensitive; export PNG data URL. |
| **Handwriting API** | Supabase Edge Function `recognize-handwriting` → calls Anthropic (Claude vision) to read the single word from the image; returns raw spelling (no auto-correction). |
| **Optional TTS API** | If we use a cloud TTS service for the “slightly monster” voice, a second Supabase Edge Function (or the same function with a different path) can call that service and return audio (URL or base64). |

No Tesseract; the doc explicitly requires Claude vision for messy child handwriting.

---

## 3. Voice / TTS (Less Robotic, Clear, Slightly Monster, Not Scary)

Three approaches:

**A. Web Speech API (browser TTS)**  
- **Pros:** No backend, no API key, no cost.  
- **Cons:** Sounds robotic; no “monster” character. We can only tweak rate/pitch (e.g. lower pitch for a slightly deeper tone).  
- **Verdict:** Does not meet “less robotic” or “slightly like a monster.”

**B. Cloud TTS API (e.g. ElevenLabs) via Supabase Edge Function**  
- **Pros:** Natural, clear voices; ElevenLabs has character/monster-style voices—we can choose a **friendly** monster or deep-but-calm voice. One consistent voice for all words/sentences.  
- **Cons:** API key and cost (per character); need to call from backend to keep key secret.  
- **Flow:** Frontend requests audio for a phrase (word or sentence) → Edge Function calls ElevenLabs → returns audio URL or base64 → frontend plays it.  
- **Verdict:** **Recommended** to meet “less robotic, very clear, slightly monster, not scary.”

**C. Pre-recorded audio (human or pre-generated TTS)**  
- **Pros:** No runtime API for TTS; can use a chosen “monster” voice once; replay is instant.  
- **Cons:** Need to record or generate audio for every word and every sentence; harder to add new word packs later.  
- **Verdict:** Good if we want zero TTS cost at runtime and a fixed word list; more ops work when word lists change.

**Recommendation:** **B — Cloud TTS (ElevenLabs) via Edge Function.**  
- Use a single voice from their library that is clear, non-scary, and slightly “creature” (e.g. deep, gentle monster or narrator-style).  
- Edge Function: `POST /functions/v1/speak` (or similar) with `{ "text": "relief", "context": "word" | "sentence" }`; call ElevenLabs; return audio (stream or base64).  
- Env: `ELEVENLABS_API_KEY` in Supabase secrets; optionally `ELEVENLABS_VOICE_ID` for the chosen voice.  
- Fallback: if the TTS request fails (quota, network), fall back to Web Speech API so the child can still play.

### TTS cost estimate (ElevenLabs)

**Chosen approach:** Best output with free-to-negligible cost.

- ElevenLabs **Free tier:** 20,000 characters/month included; overage ~$0.08 per 1,000 characters (Flash/Turbo).
- **~100 voice calls/week** ≈ 2,500–22,000 characters/month depending on mix of “word only” vs “Use in a sentence.”
- **Typical outcome:** Usage fits within the 20k Free tier → **$0/month.** If he uses “sentence” a lot and goes slightly over, overage is on the order of **$0.08–0.20/month.**

| Monthly usage (chars) | Monthly cost |
|-----------------------|--------------|
| Up to ~20,000         | $0 (Free tier) |
| ~21,000               | ~$0.08        |
| ~30,000               | ~$0.80        |

No subscription required to start; create account, get API key, use Free tier. Upgrade only if usage grows.

---

## 4. API Calls Summary

| Purpose | Where | API |
|---------|--------|-----|
| **Handwriting → text** | Supabase Edge Function `recognize-handwriting` | Anthropic (Claude vision); body: image base64 + prompt; response: `{ word: string }`. |
| **Text → speech (optional)** | Supabase Edge Function `speak` (or similar) | ElevenLabs (or other TTS); request: text + optional context; response: audio. |

Both keep API keys on the server; frontend only sends text/image and plays returned audio.

---

## 5. Game Flow (Detailed)

1. **Entry** — New route, e.g. `/spell` or `/spell-caster`, from home or a “Spell Caster” card on the existing home screen.
2. **Menu** — Choose a word pack (e.g. “Freddy’s Test Words”, “ie & ei”, “Plural Power”, “Past Tense”). Word packs and sentences come from static data (see doc).
3. **Play (per word)**  
   - Show target word only to parent/teacher if needed; student does not see it.  
   - **Speak:** Play word via TTS (primary: Edge + ElevenLabs; fallback: Web Speech).  
   - Buttons: “Hear again”, “Use in a sentence” (play sentence then word).  
   - **Write:** Canvas with baseline guide (dashed line ~72% down), white background, dark stroke; Pointer Events, pressure, pointer capture; 2x resolution for OCR.  
   - **Check:** “Check Spelling” → export canvas as PNG data URL → `recognize-handwriting` → compare returned word (normalized: lowercase, letters only) to target.  
4. **Result**  
   - **Correct:** Cryptid reveal (from doc list: Mothman, Chupacabra, Sasquatch, etc.) with animation; then next word or pack complete.  
   - **Wrong:** Show “You wrote: X” vs “Correct: Y” + spelling tip from a small rules map (ie/ei, y→ies, -ed, friend, etc.) + “Try Again” (replay word, clear canvas).  
5. **Complete** — Score summary (e.g. X of Y correct); option to replay pack or go back to menu.

---

## 6. Canvas and OCR Requirements (from doc)

- **Pointer Events** only (no separate touch/mouse); **pressure** for line width (e.g. 4–8px).  
- **2x device pixel ratio** for crisp strokes and better OCR.  
- **White background**, dark ink (#1a1a2e), **dashed baseline** at ~72% height.  
- **touch-action: none** on canvas; **setPointerCapture(pointerId)** on pointerdown.  
- Export: `canvas.toDataURL('image/png')`.  
- Claude prompt must stress: one word only, output exactly as written (including misspellings), no correction, no punctuation.

---

## 7. Data and Content

- **Word packs:** Static lists in the app (e.g. `src/data/spellCasterWords.ts` or similar) with: pack id, name, words array.  
- **Sentences:** One sentence per word (sentence + “. [Word].”) for “Use in a sentence.”  
- **Spelling tips:** Map from rule key or word to tip string (ie/ei, receive, y→ies, -ed, friend, etc.).  
- **Cryptids:** Use the 15 from the doc for reveal order; can reuse or mirror existing cryptid assets where they exist (e.g. Mothman, Chupacabra, Nessie).

---

## 8. Theming and UX (from doc)

- **Dark theme** — deep navy/midnight gradient.  
- **Fonts:** Fredoka (UI), Patrick Hand (handwriting-style hints).  
- **Colors:** Green success, amber warnings/tips, blue/purple actions; canvas prominent; big touch targets; minimal text so Freddy isn’t overwhelmed.

---

## 9. Environment and Secrets

**Existing:**  
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (already used).

**New:**  
- Supabase secrets: `ANTHROPIC_API_KEY` (for `recognize-handwriting`).  
- Supabase secrets: `ELEVENLABS_API_KEY` (and optionally `ELEVENLABS_VOICE_ID`) if we implement the recommended TTS path.

---

## 10. Implementation Order (Suggested)

1. **Data & routing** — Word packs, sentences, tips, cryptid list; add `/spell` (or chosen) route and menu screen.  
2. **Canvas component** — Drawing with Pointer Events, pressure, baseline, export PNG.  
3. **Edge Function: recognize-handwriting** — Claude vision, prompt from doc; test with sample canvas exports.  
4. **Frontend OCR client** — Call edge function, compare result to target, show correct/wrong + tips.  
5. **TTS** — Either (a) Web Speech API first (rate 0.75) for a working baseline, then (b) Edge Function + ElevenLabs + voice pick (friendly monster), with Web Speech as fallback.  
6. **Result UI** — Cryptid reveal animation; wrong-answer layout with “You wrote” / “Correct” / tip / Try Again.  
7. **Polish** — Dark theme, Fredoka/Patrick Hand, big targets, “Hear again” / “Use in a sentence” wired to chosen TTS.

---

## 11. Decisions

- **TTS:** ElevenLabs via Edge Function for the “slightly monster” voice, with Web Speech API as fallback. Free tier (20k chars/month) targets best output at free-to-negligible cost for ~100 voice calls/week.
