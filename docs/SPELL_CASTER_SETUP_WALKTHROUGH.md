# Cryptid Spell Caster — Step-by-Step Setup Walkthrough

Follow these steps to get the Spell Caster (and its handwriting + voice APIs) working end-to-end.

---

## Step 1: Local environment variables

1. In your project root, copy the example env file (if you haven’t already):
   ```bash
   copy .env.example .env
   ```
   (On macOS/Linux: `cp .env.example .env`)

2. Open `.env` and set:
   - **`VITE_SUPABASE_URL`** — Your Supabase project URL, e.g. `https://xxxxxxxxxxxx.supabase.co`
   - **`VITE_SUPABASE_ANON_KEY`** — Your Supabase anon/public key (from Project Settings → API)

3. Save the file. The app uses these for all Supabase calls, including the Spell Caster Edge Functions.

---

## Step 2: Create / open your Supabase project

1. Go to [supabase.com](https://supabase.com) and sign in.
2. Create a new project (or open the one you already use for LeveeUp).
3. Wait for the project to finish provisioning.
4. In the dashboard, go to **Project Settings** (gear) → **API** and note:
   - **Project URL** → use for `VITE_SUPABASE_URL`
   - **anon public** key → use for `VITE_SUPABASE_ANON_KEY`

---

## Step 3: Install Supabase CLI (if needed)

You need the Supabase CLI to deploy Edge Functions and set secrets.

1. Install the CLI:
   - **Windows (PowerShell):** `scoop install supabase` or download from [GitHub Releases](https://github.com/supabase/cli/releases)
   - **macOS:** `brew install supabase/tap/supabase`
   - **npm:** `npm install -g supabase`

2. Log in:
   ```bash
   supabase login
   ```
   Follow the browser prompt to authenticate.

3. Link your project (from your repo root):
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```
   `YOUR_PROJECT_REF` is the ID in your project URL (e.g. `abcdefghijklmnop` from `https://abcdefghijklmnop.supabase.co`). You can find it in Supabase Dashboard → Project Settings → General.

---

## Step 4: Set Edge Function secrets

These secrets are used by the Edge Functions; they are **not** in `.env`.

1. **Anthropic (handwriting recognition)**  
   Get an API key from [console.anthropic.com](https://console.anthropic.com). Then run:
   ```bash
   supabase secrets set ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxx
   ```
   Use your real key instead of `sk-ant-api03-xxxxxxxxxxxx`.

2. **ElevenLabs (voice)**  
   Get an API key from [elevenlabs.io](https://elevenlabs.io) (free tier is enough to start). Then run:
   ```bash
   supabase secrets set ELEVENLABS_API_KEY=your_elevenlabs_key_here
   ```
   Optional — use a “friendly monster” style voice from the ElevenLabs voice library:
   ```bash
   supabase secrets set ELEVENLABS_VOICE_ID=voice_id_from_elevenlabs
   ```
   If you don’t set `ELEVENLABS_VOICE_ID`, the app uses a default clear voice (Rachel). The app will fall back to the browser’s Web Speech API if ElevenLabs fails or the key is missing.

---

## Step 5: Deploy the Edge Functions

From your project root (where `supabase/` lives):

1. Deploy the handwriting function (Spell Caster):
   ```bash
   supabase functions deploy recognize-handwriting
   ```

2. Deploy the TTS function (Spell Caster voice):
   ```bash
   supabase functions deploy speak
   ```

3. Deploy the math evaluation function (Field Guide — Math mode):
   ```bash
   supabase functions deploy evaluate-math
   ```
   This uses the same `ANTHROPIC_API_KEY` secret. It evaluates equation, model, statement, strategy, true/false work, and check-equation steps.

4. Confirm in the Supabase Dashboard: **Edge Functions** should list `recognize-handwriting`, `speak`, and `evaluate-math`.

---

## Step 6: (Optional) Check the Anthropic model ID

The handwriting function calls Claude with model `claude-sonnet-4-20250514`. If your Anthropic account doesn’t have that model:

1. Open `supabase/functions/recognize-handwriting/index.ts`.
2. Find the `model` field in the request body (e.g. `model: 'claude-sonnet-4-20250514'`).
3. Change it to a model you have, e.g. `claude-3-5-sonnet-20241022` or another vision-capable Claude model from the [Anthropic docs](https://docs.anthropic.com/en/docs/about-claude/models).

Redeploy after changing:
```bash
supabase functions deploy recognize-handwriting
```

---

## Step 7: Run the app and test Spell Caster

1. From the project root:
   ```bash
   npm install
   npm run dev
   ```

2. Open the app in the browser (e.g. http://localhost:5173).

3. Log in (or pick a profile), then:
   - Click **Spell** in the bottom nav, or  
   - Open **Home** and tap the **Cryptid Spell Caster** card.

4. Choose a word pack (e.g. “Freddy’s Test Words”).

5. For each word:
   - **Hear again** — replays the word (ElevenLabs or browser TTS).
   - **Use in a sentence** — plays the sentence then the word.
   - Draw the word on the canvas (stylus or finger/mouse).
   - **Check spelling** — sends the canvas to `recognize-handwriting` and shows correct (cryptid) or wrong (tip + try again).

6. If voice doesn’t play: check that `ELEVENLABS_API_KEY` is set and that the `speak` function deployed. The app will fall back to browser TTS if the Edge Function fails.

7. If “Check spelling” fails: check that `ANTHROPIC_API_KEY` is set, that `recognize-handwriting` is deployed, and that the model ID in the function exists in your Anthropic account.

---

## Quick checklist

- [ ] `.env` has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- [ ] Supabase project exists and is linked (`supabase link`)
- [ ] `ANTHROPIC_API_KEY` set via `supabase secrets set`
- [ ] `ELEVENLABS_API_KEY` set via `supabase secrets set`
- [ ] `supabase functions deploy recognize-handwriting` succeeded
- [ ] `supabase functions deploy speak` succeeded
- [ ] App runs with `npm run dev` and Spell Caster is reachable from Home or nav
- [ ] Voice plays (ElevenLabs or browser fallback)
- [ ] After drawing a word and clicking “Check spelling”, you get either a cryptid (correct) or a tip (wrong)

---

## Troubleshooting

| Issue | What to check |
|-------|----------------|
| “OCR failed” / 500 on check | Anthropic key set? Model ID valid? Edge Function logs in Supabase Dashboard → Edge Functions → Logs. |
| No voice / “Could not play sound” | ElevenLabs key set? `speak` deployed? Try “Hear again” — if it still fails, browser may block autoplay until user has interacted. |
| CORS errors in browser | Edge Functions return CORS headers; ensure you’re calling the same Supabase URL as in `VITE_SUPABASE_URL`. |
| Blank or wrong word from canvas | Claude returns exactly what it reads; prompt asks for no correction. If it’s wrong, try clearer writing or a whiter background (canvas is already white). |

For more on design and cost (e.g. ElevenLabs free tier), see `docs/plans/2025-03-12-cryptid-spell-caster-design.md`.
