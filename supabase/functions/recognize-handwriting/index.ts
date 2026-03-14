import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS });
  }

  try {
    const { imageBase64 } = (await req.json()) as { imageBase64?: string };
    if (!imageBase64 || !ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Missing imageBase64 or ANTHROPIC_API_KEY' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...CORS } }
      );
    }

    const base64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 50,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/png',
                  data: base64,
                },
              },
              {
                type: 'text',
                text: `You are reading a single handwritten word written by a 7-year-old child using a stylus on a tablet screen.

CRITICAL INSTRUCTIONS:
- The image contains exactly ONE word written in a child's handwriting
- The handwriting will be messy, with inconsistent letter sizes, wobbly lines, and imperfect spacing
- Read the word EXACTLY as the child wrote it, including any misspellings
- Do NOT correct the spelling — if they wrote "relef" output "relef", not "relief"
- Do NOT add punctuation, explanation, or quotes
- Output ONLY the single lowercase word, nothing else
- If letters are ambiguous, make your best guess based on letter shapes
- Common child handwriting quirks: 'a' and 'o' look similar, 'e' and 'i' can be hard to distinguish, letters may be reversed or oddly sized

Output the word now:`,
              },
            ],
          },
        ],
      }),
    });

    const data = (await response.json()) as { content?: Array<{ type: string; text?: string }>; error?: { message?: string } };
    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: 'Recognition failed', detail: (data as { error?: { message?: string } }).error?.message ?? response.statusText }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...CORS } }
      );
    }

    const text = (data.content ?? [])
      .filter((block: { type: string }) => block.type === 'text')
      .map((block: { text?: string }) => block.text ?? '')
      .join('')
      .trim()
      .toLowerCase()
      .replace(/[^a-z]/g, '');

    return new Response(JSON.stringify({ word: text || '' }), {
      headers: { 'Content-Type': 'application/json', ...CORS },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Recognition failed', detail: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...CORS } }
    );
  }
});
