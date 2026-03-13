/**
 * Handwriting recognition client for Cryptid Spell Caster.
 * Calls Supabase Edge Function which uses Claude vision to read one word from canvas image.
 */

const getEdgeUrl = () => {
  const url = import.meta.env.VITE_SUPABASE_URL as string;
  if (!url) throw new Error('VITE_SUPABASE_URL is required for handwriting recognition');
  return `${url}/functions/v1/recognize-handwriting`;
};

const getAnonKey = () => import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export async function recognizeHandwriting(canvasDataUrl: string): Promise<string> {
  const response = await fetch(getEdgeUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAnonKey()}`,
    },
    body: JSON.stringify({ imageBase64: canvasDataUrl }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as { detail?: string }).detail || `OCR failed: ${response.status}`);
  }

  const data = (await response.json()) as { word?: string };
  return (data.word ?? '').trim().toLowerCase().replace(/[^a-z]/g, '') || '';
}

/** Normalize for comparison: lowercase, letters only. */
export function normalizeWord(w: string): string {
  return w.trim().toLowerCase().replace(/[^a-z]/g, '');
}

export function isSpellingCorrect(recognized: string, target: string): boolean {
  return normalizeWord(recognized) === normalizeWord(target);
}
