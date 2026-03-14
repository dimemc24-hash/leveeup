/**
 * Text-to-speech for Cryptid Spell Caster.
 * Primary: ElevenLabs via Supabase Edge Function (friendly monster voice).
 * Fallback: Web Speech API when edge fails or key not set.
 */

const getEdgeUrl = () => {
  const url = import.meta.env.VITE_SUPABASE_URL as string;
  if (!url) return null;
  return `${url}/functions/v1/speak`;
};

const getAnonKey = () => import.meta.env.VITE_SUPABASE_ANON_KEY as string;

/** Play text via Edge Function (ElevenLabs). Returns true if played, false to use fallback. */
export async function speakViaEdge(text: string): Promise<boolean> {
  const url = getEdgeUrl();
  if (!url) return false;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAnonKey()}`,
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) return false;

    const blob = await response.blob();
    if (!blob.size) return false;

    const audio = new Audio(URL.createObjectURL(blob));
    await new Promise<void>((resolve, reject) => {
      audio.onended = () => {
        URL.revokeObjectURL(audio.src);
        resolve();
      };
      audio.onerror = () => {
        URL.revokeObjectURL(audio.src);
        reject(new Error('Audio playback failed'));
      };
      audio.play().catch(reject);
    });
    return true;
  } catch {
    return false;
  }
}

/** Fallback: browser Web Speech API (rate 0.75 for clarity). */
export function speakViaBrowser(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!window.speechSynthesis) {
      reject(new Error('Speech not supported'));
      return;
    }
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.85;
    u.pitch = 0.9;
    const voices = speechSynthesis.getVoices();
    const en = voices.find((v) => v.lang.startsWith('en'));
    if (en) u.voice = en;
    u.onend = () => resolve();
    u.onerror = () => reject(new Error('Speech failed'));
    speechSynthesis.speak(u);
  });
}

/** Speak text: try Edge (ElevenLabs) first, then Web Speech API. */
export async function speak(text: string): Promise<void> {
  const played = await speakViaEdge(text);
  if (played) return;
  await speakViaBrowser(text);
}
