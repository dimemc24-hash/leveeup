import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

interface ProblemContext {
  problem: string;
  expectedAnswer: number | string;
  expectedEquation?: string;
  leftValue?: number;
  rightValue?: number;
}

interface MathRequest {
  imageBase64: string;
  evaluationType: 'equation' | 'model_present' | 'statement' | 'strategy_explanation' | 'true_false_work' | 'check_equation';
  problemContext: ProblemContext;
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const PROMPTS: Record<string, (ctx: ProblemContext) => string> = {
  equation: (ctx) =>
    `You are reading handwritten math work by a 7-year-old child on a tablet.

The problem was: ${ctx.problem}
The correct answer is: ${ctx.expectedAnswer}

Look at this image and:
1. Read the handwritten content exactly as written — the writing will be messy with inconsistent letter/number sizes
2. Identify if there is a complete equation present (like "63 - 48 = 15"), not just a bare number
3. Extract the numerical answer the child wrote

A complete equation has: a number, an operation sign, another number, an equals sign, and a result.
Just writing "15" alone is NOT an equation. Writing "63 - 48 = 15" IS an equation.

Respond in JSON only. No markdown, no backticks, no explanation:
{"written": "what you see written", "hasEquation": true or false, "answer": number or null}`,

  model_present: (ctx) =>
    `You are checking a 7-year-old child's math work drawn on a tablet with a stylus.

The child was asked to draw a model (tape diagram, place value chart, number line, array, tally marks, or similar visual representation) for this problem: ${ctx.problem}

Look at the image carefully. Is there a meaningful drawing or model present?
- Any attempt at a diagram, chart, number line, tally marks, place value boxes, tape/bar diagram, or visual representation counts as YES
- A completely empty or nearly empty canvas (just a dot or stray mark) counts as NO
- The drawing does NOT need to be correct or neat — just present and intentional

Respond in JSON only. No markdown, no backticks, no explanation:
{"hasModel": true or false, "description": "brief description of what you see"}`,

  statement: (ctx) =>
    `You are reading a 7-year-old child's handwritten answer statement on a tablet.

The problem was: ${ctx.problem}
The correct answer is: ${ctx.expectedAnswer}

Read the handwritten text. Check two things:
1. Is it a complete sentence (has a subject and verb, not just a bare number)?
2. Does it contain the correct numerical answer (${ctx.expectedAnswer})?

Be very generous with spelling, grammar, and punctuation — this is a 7-year-old writing with a stylus. Focus on whether the MEANING is a sentence containing the answer.

"15 teachers went to the zoo" = YES (sentence + correct answer)
"15 teachers go to the zoo" = YES (close enough for a 7-year-old)
"15" = NO (bare number, not a sentence)
"the teachers went to the zoo" = PARTIAL (sentence but missing the number)

Respond in JSON only. No markdown, no backticks, no explanation:
{"written": "what you see written", "isSentence": true or false, "containsAnswer": true or false}`,

  strategy_explanation: (ctx) =>
    `You are reading a 7-year-old child's handwritten explanation of their math strategy on a tablet.

The problem was: ${ctx.problem}
The child's answer was: ${ctx.expectedAnswer}

Read the handwritten text. Evaluate whether the child described an actual mathematical strategy — meaning they explained WHAT THEY DID with the numbers, not just that they did it.

GOOD explanations (pass) — these mention a real method:
- "I used a place value chart"
- "I broke it into hundreds tens and ones"
- "I subtracted 300 then added 2 back"
- "I counted up from 298"
- "I drew a number line"
- "I regrouped the tens"

BAD explanations (fail) — these are vague and don't describe a method:
- "it was easy"
- "I subtracted"
- "I just did it"
- "because math"
- "I used my brain"

Be very generous with spelling and grammar. A misspelled but meaningful strategy description should PASS. Focus ONLY on whether they described a real method.

Respond in JSON only. No markdown, no backticks, no explanation:
{"written": "what you see written", "describesStrategy": true or false, "feedback": "a short encouraging tip if the explanation was too vague, empty string if it passed"}`,

  true_false_work: (ctx) =>
    `You are reading a 7-year-old child's handwritten work for a true/false equation problem on a tablet.

The problem was: Is this true or false? ${ctx.problem}
The correct answer is: ${ctx.expectedAnswer} (because left side = ${ctx.leftValue}, right side = ${ctx.rightValue})

Read the handwritten content. Check:
1. Did the child write "True" or "False" (or T/F)?
2. Did they show work evaluating BOTH sides of the equation? (e.g., showing "14-5=9" AND "16-7=9", not just writing True/False)

Respond in JSON only. No markdown, no backticks, no explanation:
{"answer": "true" or "false" or "unclear", "showedBothSides": true or false, "written": "what you see"}`,

  check_equation: (ctx) =>
    `You are reading a 7-year-old child's handwritten addition check for a subtraction problem on a tablet.

The original subtraction problem was: ${ctx.problem}
The child's subtraction answer was: ${ctx.expectedAnswer}
A valid addition check would be something like: ${ctx.expectedEquation}

Read the handwritten content. Check:
1. Is there an addition equation present?
2. Does it represent a valid check of the subtraction? (The child's answer + the subtracted number should equal the original number)

The equation doesn't need to exactly match the expected format — any valid addition check counts. Be generous with messy handwriting.

Respond in JSON only. No markdown, no backticks, no explanation:
{"written": "what you see written", "hasCheckEquation": true or false, "isValidCheck": true or false}`,
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS });
  }

  try {
    const body = (await req.json()) as MathRequest;
    const { imageBase64, evaluationType, problemContext } = body;

    if (!ANTHROPIC_API_KEY || !imageBase64 || !problemContext) {
      return new Response(
        JSON.stringify({ error: 'Missing ANTHROPIC_API_KEY, imageBase64, or problemContext' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...CORS } }
      );
    }

    const base64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const promptFn = PROMPTS[evaluationType];

    if (!promptFn) {
      return new Response(
        JSON.stringify({ error: `Unknown evaluationType: ${evaluationType}` }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...CORS } }
      );
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 200,
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
                text: promptFn(problemContext),
              },
            ],
          },
        ],
      }),
    });

    const data = (await response.json()) as {
      content?: Array<{ type: string; text?: string }>;
      error?: { message?: string };
    };

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: 'Evaluation failed', detail: data.error?.message ?? response.statusText }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...CORS } }
      );
    }

    const rawText = (data.content ?? [])
      .filter((block: { type: string }) => block.type === 'text')
      .map((block: { text?: string }) => block.text ?? '')
      .join('')
      .trim();

    let evaluation: unknown;
    try {
      const cleaned = rawText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      evaluation = JSON.parse(cleaned);
    } catch {
      evaluation = { raw: rawText, parseError: true };
    }

    return new Response(JSON.stringify({ evaluation }), {
      headers: { 'Content-Type': 'application/json', ...CORS },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Evaluation failed', detail: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...CORS } }
    );
  }
});
