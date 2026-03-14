/**
 * Math Field Guide — canvas evaluation client.
 * Calls Supabase Edge Function evaluate-math (Claude vision) for equation, model, statement, strategy, etc.
 */

export type MathEvalType =
  | 'equation'
  | 'model_present'
  | 'statement'
  | 'strategy_explanation'
  | 'true_false_work'
  | 'check_equation';

export interface MathProblemContext {
  problem: string;
  expectedAnswer: number | string;
  expectedEquation?: string;
  leftValue?: number;
  rightValue?: number;
}

const getEdgeUrl = () => {
  const url = import.meta.env.VITE_SUPABASE_URL as string;
  if (!url) throw new Error('VITE_SUPABASE_URL is required for math evaluation');
  return `${url}/functions/v1/evaluate-math`;
};

const getAnonKey = () => import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export async function evaluateMathCanvas(
  canvasDataUrl: string,
  evaluationType: MathEvalType,
  problemContext: MathProblemContext
): Promise<unknown> {
  const response = await fetch(getEdgeUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAnonKey()}`,
    },
    body: JSON.stringify({
      imageBase64: canvasDataUrl,
      evaluationType,
      problemContext,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as { detail?: string }).detail || `Math eval failed: ${response.status}`);
  }

  const data = (await response.json()) as { evaluation?: unknown };
  return data.evaluation ?? {};
}
