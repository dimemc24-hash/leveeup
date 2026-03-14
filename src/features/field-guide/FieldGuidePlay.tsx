import { useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mathProblemPacks, fieldGuideCryptids } from '../../data/mathFieldGuide';
import { HandwritingCanvas, type HandwritingCanvasRef } from '../spell-caster/HandwritingCanvas';
import { evaluateMathCanvas } from '../../lib/mathEval';
import {
  parseStepEvaluation,
  isAnswerCorrect,
  calculateResult,
  type StepResult,
  type StepOutcome,
} from './mathStepResult';
import type { MathProblem, ProblemStep } from '../../data/mathFieldGuide';

type Phase = 'step' | 'submitting' | 'step_failed' | 'result';

export function FieldGuidePlay() {
  const { packId } = useParams<{ packId: string }>();
  const navigate = useNavigate();
  const pack = mathProblemPacks.find((p) => p.id === packId);
  const [problemIndex, setProblemIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [stepResults, setStepResults] = useState<StepResult[]>([]);
  const [phase, setPhase] = useState<Phase>('step');
  const [failFeedback, setFailFeedback] = useState('');
  const canvasRef = useRef<HandwritingCanvasRef>(null);

  const problems = pack?.problems ?? [];
  const problem = problems[problemIndex];
  const steps = problem?.steps ?? [];
  const currentStep = steps[stepIndex];
  const cryptid = fieldGuideCryptids[Math.min(problemIndex, fieldGuideCryptids.length - 1)];

  const handleDone = useCallback(async () => {
    if (!problem || !currentStep || !canvasRef.current) return;
    const dataUrl = canvasRef.current.getDataUrl();
    if (!dataUrl) return;

    setPhase('submitting');
    setFailFeedback('');

    const problemContext = {
      problem: problem.problem,
      expectedAnswer: problem.expectedAnswer,
      expectedEquation: problem.expectedEquation,
      leftValue: problem.leftValue,
      rightValue: problem.rightValue,
    };

    try {
      const evaluation = await evaluateMathCanvas(dataUrl, currentStep.evaluationType, problemContext);
      const { passed, feedback } = parseStepEvaluation(currentStep, problem, evaluation);

      if (passed) {
        setStepResults((prev) => [
          ...prev,
          { stepId: currentStep.id, stepType: currentStep.type, outcome: 'passed', evaluation, thumbnailDataUrl: dataUrl },
        ]);
        canvasRef.current.clear();
        if (stepIndex >= steps.length - 1) {
          setPhase('result');
        } else {
          setStepIndex((i) => i + 1);
          setPhase('step');
        }
      } else {
        setFailFeedback(feedback ?? "That's not quite right. Try again or skip.");
        setPhase('step_failed');
      }
    } catch (err) {
      setFailFeedback(err instanceof Error ? err.message : 'Could not check your work. Try again.');
      setPhase('step_failed');
    }
  }, [problem, currentStep, stepIndex, steps.length]);

  const handleSkip = useCallback(() => {
    if (!currentStep) return;
    setStepResults((prev) => [
      ...prev,
      { stepId: currentStep.id, stepType: currentStep.type, outcome: 'skipped', thumbnailDataUrl: undefined },
    ]);
    canvasRef.current?.clear();
    if (stepIndex >= steps.length - 1) {
      setPhase('result');
    } else {
      setStepIndex((i) => i + 1);
      setPhase('step');
    }
    setFailFeedback('');
  }, [currentStep, stepIndex, steps.length]);

  const handleRedo = useCallback(() => {
    setPhase('step');
    setFailFeedback('');
  }, []);

  const handleNextProblem = useCallback(() => {
    if (problemIndex >= problems.length - 1) {
      navigate('/field-guide');
      return;
    }
    setProblemIndex((i) => i + 1);
    setStepIndex(0);
    setStepResults([]);
    setPhase('step');
    setFailFeedback('');
    canvasRef.current?.clear();
  }, [problemIndex, problems.length, navigate]);

  const handleTryAgain = useCallback(() => {
    setStepIndex(0);
    setStepResults([]);
    setPhase('step');
    setFailFeedback('');
    canvasRef.current?.clear();
  }, []);

  if (!pack) {
    return (
      <div className="spell-caster-page p-4 text-center text-spell-cream">
        <p>Pack not found.</p>
        <button type="button" onClick={() => navigate('/field-guide')} className="mt-4 px-4 py-2 rounded-xl bg-spell-accent text-spell-dark font-bold">
          Back to menu
        </button>
      </div>
    );
  }

  if (phase === 'result' && problem) {
    const answerCorrect = isAnswerCorrect(problem, stepResults);
    const resultType = calculateResult(stepResults, answerCorrect);

    if (resultType === 'full_reveal') {
      return (
        <div className="spell-caster-page p-4 max-w-lg mx-auto space-y-4">
          <div className="rounded-2xl p-6 bg-spell-success/20 border-2 border-spell-success text-center animate-bounce-in">
            <div className="text-5xl mb-2">⭐</div>
            <h2 className="font-display font-bold text-spell-success text-xl">Field Researcher!</h2>
            <div className="text-5xl mt-4 mb-2">{cryptid.emoji}</div>
            <h3 className="font-display font-bold text-spell-cream text-lg">{cryptid.name}</h3>
            <p className="text-spell-cream text-sm mt-1">{cryptid.oneLiner}</p>
            <button type="button" onClick={handleNextProblem} className="mt-6 w-full py-3 rounded-xl bg-spell-success text-white font-bold touch-target">
              Next problem
            </button>
          </div>
        </div>
      );
    }

    if (resultType === 'silhouette') {
      const stepLabels: Record<string, string> = { model: 'Drew a model', equation: 'Wrote the equation', statement: 'Wrote a statement', check_equation: 'Wrote the check', strategy_explanation: 'Explained strategy', true_false_work: 'Showed work for both sides' };
      return (
        <div className="spell-caster-page p-4 max-w-lg mx-auto space-y-4">
          <div className="rounded-2xl p-5 border-2 border-spell-muted bg-spell-card text-center">
            <p className="text-spell-wrong font-bold">It escaped!</p>
            <p className="text-spell-muted text-sm mt-2">Your answer was right, but incomplete field notes mean the cryptid got away.</p>
            <div className="my-4 flex justify-center">
              <span className="text-5xl opacity-30 grayscale" aria-hidden="true">{cryptid.emoji}</span>
            </div>
            <p className="text-spell-cream font-display font-bold">{cryptid.name}</p>
            <div className="mt-4 text-left bg-spell-bg/50 rounded-xl p-3 text-sm text-spell-cream">
              {stepResults.map((r) => (
                <div key={r.stepId} className="flex items-center gap-2">
                  {r.outcome === 'passed' ? '✅' : '❌'} {stepLabels[r.stepType] ?? r.stepType}
                  {r.outcome === 'skipped' && <span className="text-spell-wrong text-xs">← skipped</span>}
                </div>
              ))}
            </div>
            <button type="button" onClick={handleNextProblem} className="mt-4 w-full py-3 rounded-xl bg-spell-accent text-spell-dark font-bold touch-target">
              Next problem
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="spell-caster-page p-4 max-w-lg mx-auto space-y-4">
        <div className="rounded-2xl p-5 border-2 border-spell-wrong bg-spell-wrong/10 text-center">
          <p className="text-spell-wrong font-bold">Lost the trail…</p>
          <p className="text-spell-cream mt-2">{problem.strategyTip}</p>
          <div className="flex gap-3 mt-4">
            <button type="button" onClick={handleTryAgain} className="flex-1 py-3 rounded-xl border-2 border-spell-accent text-spell-cream font-bold touch-target">
              Try again
            </button>
            <button type="button" onClick={handleNextProblem} className="flex-1 py-3 rounded-xl bg-spell-accent text-spell-dark font-bold touch-target">
              Next problem
            </button>
          </div>
        </div>
      </div>
    );
  }

  const canvasWidth = Math.min(520, typeof window !== 'undefined' ? window.innerWidth - 32 : 520);
  const canvasHeight = currentStep?.canvasHeight ?? 280;
  const isModelStep = currentStep?.type === 'model';

  return (
    <div className="spell-caster spell-caster-page p-4 max-w-lg mx-auto space-y-4">
      <div className="flex items-center justify-between text-spell-muted text-sm">
        <span>Problem {problemIndex + 1} of {problems.length}</span>
        <button type="button" onClick={() => navigate('/field-guide')} className="text-spell-accent font-medium" aria-label="Exit to menu">
          Exit
        </button>
      </div>

      <div className="rounded-2xl bg-spell-accent/20 border-2 border-spell-accent p-5 text-spell-cream">
        <p className="font-display font-bold text-xl md:text-2xl text-center leading-snug">{problem?.problem}</p>
      </div>

      {/* Step tracker */}
      <div className="flex flex-wrap gap-2">
        {steps.map((s, i) => {
          const res = stepResults.find((r) => r.stepId === s.id);
          const status: StepOutcome = res ? res.outcome : i < stepIndex ? 'passed' : i === stepIndex ? 'pending' : 'pending';
          const label = s.type === 'model' ? '🗺️' : s.type === 'equation' ? '⚡' : s.type === 'statement' ? '📝' : s.type === 'strategy_explanation' ? '📖' : '✓';
          return (
            <div
              key={s.id}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                status === 'passed' ? 'bg-spell-success/30 text-spell-success' : status === 'skipped' ? 'bg-spell-wrong/20 text-spell-wrong' : status === 'pending' && i === stepIndex ? 'bg-spell-accent/30 text-spell-cream' : 'bg-spell-card text-spell-muted'
              }`}
            >
              {status === 'passed' ? '✓' : status === 'skipped' ? '⚠' : label} Step {i + 1}
            </div>
          );
        })}
      </div>

      {/* Collapsed thumbnails */}
      {stepResults.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {stepResults.map((r) => (
            <div key={r.stepId} className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 border-spell-border bg-white flex flex-col items-center justify-center relative">
              {r.thumbnailDataUrl ? (
                <img src={r.thumbnailDataUrl} alt="" className="w-full h-full object-contain" />
              ) : (
                <span className="text-spell-muted text-2xl">⚠</span>
              )}
              <span className={`absolute top-0.5 right-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${r.outcome === 'passed' ? 'bg-spell-success text-white' : 'bg-spell-tip text-spell-dark'}`}>{r.outcome === 'passed' ? '✓' : '⚠'}</span>
            </div>
          ))}
        </div>
      )}

      {currentStep && (
        <>
          <p className="text-spell-cream font-medium">{currentStep.prompt}</p>
          <HandwritingCanvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            showGrid={isModelStep}
          />
          <button
            type="button"
            onClick={() => canvasRef.current?.clear()}
            className="w-full py-2.5 rounded-xl border-2 border-spell-muted text-spell-muted font-medium text-sm touch-target hover:bg-spell-card"
            aria-label="Clear your drawing to start over"
          >
            Clear entry
          </button>
          {phase === 'submitting' && (
            <div className="flex items-center justify-center gap-2 text-spell-muted">
              <span className="w-5 h-5 border-2 border-spell-muted border-t-spell-cream rounded-full animate-spin" />
              Analyzing field notes…
            </div>
          )}
          {phase === 'step_failed' && failFeedback && (
            <div className="rounded-xl bg-spell-wrong/15 border border-spell-wrong p-3 text-spell-cream text-sm">
              <p>{failFeedback}</p>
              <div className="flex gap-2 mt-2">
                <button type="button" onClick={handleRedo} className="px-4 py-2 rounded-lg border border-spell-accent text-spell-cream font-medium">
                  Redo
                </button>
                {!currentStep.required && (
                  <button type="button" onClick={handleSkip} className="px-4 py-2 rounded-lg bg-spell-accent text-spell-dark font-medium">
                    Skip
                  </button>
                )}
              </div>
            </div>
          )}
          {phase === 'step' && (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleDone}
                className="flex-1 py-4 rounded-xl bg-spell-success text-white font-bold touch-target"
              >
                Done ✓
              </button>
              {!currentStep.required && (
                <button type="button" onClick={handleSkip} className="py-4 px-4 rounded-xl border-2 border-spell-muted text-spell-muted font-medium touch-target">
                  Skip
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
