/**
 * Parse evaluate-math response by step type and determine pass/fail.
 */

import type { MathProblem, ProblemStep } from '../../data/mathFieldGuide';

export type StepOutcome = 'pending' | 'passed' | 'failed' | 'skipped';

export interface StepResult {
  stepId: string;
  stepType: string;
  outcome: StepOutcome;
  evaluation?: unknown;
  feedback?: string;
  thumbnailDataUrl?: string;
}

function numEqual(a: number | string, b: number | string): boolean {
  if (typeof a === 'number' && typeof b === 'number') return a === b;
  return String(a).trim().toLowerCase() === String(b).trim().toLowerCase();
}

/** Determine if the equation step has the correct answer (for overall result). */
export function isAnswerCorrect(problem: MathProblem, stepResults: StepResult[]): boolean {
  const equationStep = problem.steps.find((s) => s.evaluationType === 'equation');
  if (!equationStep) {
    const tfStep = problem.steps.find((s) => s.evaluationType === 'true_false_work');
    if (tfStep) {
      const r = stepResults.find((s) => s.stepId === tfStep.id);
      const ev = r?.evaluation as { answer?: string } | undefined;
      return ev?.answer?.toLowerCase() === String(problem.expectedAnswer).toLowerCase();
    }
    return false;
  }
  const r = stepResults.find((s) => s.stepId === equationStep.id);
  const ev = r?.evaluation as { answer?: number | null; hasEquation?: boolean } | undefined;
  if (!ev) return false;
  if (ev.answer != null && numEqual(ev.answer, problem.expectedAnswer)) return true;
  return false;
}

/** Parse evaluation response for a step and return whether it passed + optional feedback. */
export function parseStepEvaluation(
  step: ProblemStep,
  problem: MathProblem,
  evaluation: unknown
): { passed: boolean; feedback?: string } {
  const ev = evaluation as Record<string, unknown>;
  switch (step.evaluationType) {
    case 'equation': {
      const hasEquation = ev.hasEquation === true;
      const answer = ev.answer;
      const answerOk = answer != null && numEqual(answer as number, problem.expectedAnswer);
      return { passed: hasEquation && answerOk, feedback: hasEquation ? undefined : 'Write the full equation (e.g. 63 - 48 = 15), not just the answer.' };
    }
    case 'model_present':
      return { passed: ev.hasModel === true };
    case 'statement':
      return { passed: ev.isSentence === true && ev.containsAnswer === true };
    case 'strategy_explanation':
      return { passed: ev.describesStrategy === true, feedback: (ev.feedback as string) || undefined };
    case 'true_false_work': {
      const answerOk = String(ev.answer || '').toLowerCase() === String(problem.expectedAnswer).toLowerCase();
      const bothSides = ev.showedBothSides === true;
      return { passed: answerOk && bothSides, feedback: bothSides ? undefined : 'Show work for BOTH sides, then write True or False.' };
    }
    case 'check_equation':
      return { passed: ev.hasCheckEquation === true && ev.isValidCheck === true, feedback: ev.isValidCheck ? undefined : 'Write an addition equation that checks your subtraction (answer + smaller number = bigger number).' };
    default:
      return { passed: false };
  }
}

export function calculateResult(stepResults: StepResult[], answerCorrect: boolean): 'full_reveal' | 'silhouette' | 'lost_trail' {
  const allPassed = stepResults.filter((r) => r.outcome !== 'pending').every((r) => r.outcome === 'passed');
  const anySkipped = stepResults.some((r) => r.outcome === 'skipped');

  if (answerCorrect && allPassed && !anySkipped) return 'full_reveal';
  if (answerCorrect && anySkipped) return 'silhouette';
  return 'lost_trail';
}
