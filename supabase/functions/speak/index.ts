import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
const ELEVENLABS_VOICE_ID = Deno.env.get('ELEVENLABS_VOICE_ID') ?? 'wXvR48IpOq9HACltTmt7';

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
    const { text } = (await req.json()) as { text?: string };
    if (!text || typeof text !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing text' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...CORS },
      });
    }
    if (!ELEVENLABS_API_KEY) {
      return new Response(JSON.stringify({ error: 'TTS not configured' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json', ...CORS },
      });
    }

    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text: text.slice(0, 5000),
        model_id: 'eleven_turbo_v2_5',
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`ElevenLabs error ${res.status}: ${err}`);
      return new Response(JSON.stringify({ error: 'TTS failed', status: res.status, detail: err }), {
        status: res.status,
        headers: { 'Content-Type': 'application/json', ...CORS },
      });
    }

    const audio = await res.arrayBuffer();
    return new Response(audio, {
      headers: {
        'Content-Type': 'audio/mpeg',
        ...CORS,
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'TTS failed', detail: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...CORS } }
    );
  }
});
