import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../hooks/useGameStore';
import { useTheme } from '../themes/engine/ThemeContext';
import { getQuestionsForSession, getRecommendedSubject } from '../../lib/questions';
import type { Subject } from '../../types';

const subjects: { id: Subject | 'mixed'; label: string; subtitle: string; icon: string; color: string }[] = [
  { id: 'math', label: 'Evidence Analysis', subtitle: '(Math)', icon: '🔢', color: 'bg-blue-100 border-blue-300 text-blue-800' },
  { id: 'ela', label: 'Field Reports', subtitle: '(ELA)', icon: '📚', color: 'bg-purple-100 border-purple-300 text-purple-800' },
  { id: 'science', label: 'Specimen Study', subtitle: '(Science)', icon: '🔬', color: 'bg-green-100 border-green-300 text-green-800' },
  { id: 'social_studies', label: 'Territory Intel', subtitle: '(Social Studies)', icon: '🗺️', color: 'bg-amber-100 border-amber-300 text-amber-800' },
  { id: 'mixed', label: 'Mixed Mission', subtitle: '', icon: '🎯', color: 'bg-forest/10 border-forest text-forest' },
];

type SubMode = 'math-sub' | 'ela-sub' | 'mixed-sub' | null;

export function SubjectSelect() {
  const navigate = useNavigate();
  const { progress, startSession, markCycleDone } = useGameStore();
  const { getNarrative } = useTheme();
  const [loading, setLoading] = useState(false);
  const [subMode, setSubMode] = useState<SubMode>(null);
  const [cycleJustReset, setCycleJustReset] = useState(false);

  const recommended = getRecommendedSubject(progress.standardProgress);
  const cycle = progress.cycleCompleted ?? [];

  // Subject-level lock: locked when ALL sub-modes for that subject are done
  const mathLocked = cycle.includes('math-quick') && cycle.includes('math-fieldguide');
  const elaLocked = cycle.includes('ela-casefile') && cycle.includes('ela-whispers');
  const scienceLocked = cycle.includes('science');
  const socialLocked = cycle.includes('social_studies');

  const isSubjectLocked = (id: Subject | 'mixed'): boolean => {
    if (id === 'mixed') return false;
    if (id === 'math') return mathLocked;
    if (id === 'ela') return elaLocked;
    if (id === 'science') return scienceLocked;
    if (id === 'social_studies') return socialLocked;
    return false;
  };

  const doCycleMark = (unit: string) => {
    const prevLen = (useGameStore.getState().progress.cycleCompleted ?? []).length;
    markCycleDone(unit);
    const newLen = (useGameStore.getState().progress.cycleCompleted ?? []).length;
    // If length went from >=5 to 0, cycle was reset
    if (prevLen >= 5 && newLen === 0) {
      setCycleJustReset(true);
      setTimeout(() => setCycleJustReset(false), 3000);
    }
  };

  const handleSelect = async (subject: Subject | 'mixed') => {
    if (isSubjectLocked(subject)) return;
    // Math shows sub-mode picker
    if (subject === 'math') {
      setSubMode('math-sub');
      return;
    }
    // ELA shows sub-mode picker
    if (subject === 'ela') {
      setSubMode('ela-sub');
      return;
    }
    // Mixed shows sub-mode picker
    if (subject === 'mixed') {
      setSubMode('mixed-sub');
      return;
    }
    // Other subjects go directly to question flow
    if (subject === 'science') doCycleMark('science');
    if (subject === 'social_studies') doCycleMark('social_studies');
    await startQuestionSession(subject);
  };

  const startQuestionSession = async (subject: Subject | 'mixed') => {
    if (loading) return;
    setLoading(true);
    try {
      const questions = await getQuestionsForSession(subject, progress.standardProgress, 10);
      if (questions.length === 0) {
        setLoading(false);
        return;
      }
      startSession(questions, subject);
      navigate('/play/session');
    } catch {
      setLoading(false);
    }
  };

  // Sub-mode picker for Math
  if (subMode === 'math-sub') {
    const quickDone = cycle.includes('math-quick');
    const guideDone = cycle.includes('math-fieldguide');
    return (
      <div className="p-4 max-w-lg mx-auto space-y-4 animate-slide-up">
        {cycleJustReset && (
          <div className="rounded-xl bg-green-100 border-2 border-green-400 text-green-800 p-3 text-center font-bold animate-slide-up">
            All missions complete! New cycle unlocked! 🎉
          </div>
        )}
        <div className="journal-card bg-white/90 rounded-2xl p-5 shadow-sm">
          <h2 className="font-display text-xl font-bold text-forest mb-1">Evidence Analysis</h2>
          <p className="text-sm text-bark-light">Choose your analysis method</p>
        </div>
        <div className="space-y-3">
          <button
            onClick={() => { doCycleMark('math-quick'); startQuestionSession('math'); }}
            disabled={loading || quickDone}
            className={`w-full rounded-xl p-4 md:p-5 text-left border-2 min-h-[64px] text-base md:text-lg transition-all hover:shadow-md flex items-center gap-3 disabled:opacity-60 bg-blue-100 border-blue-300 text-blue-800 ${quickDone ? 'opacity-55' : ''}`}
            aria-label="Quick Calculations — math questions"
          >
            <span className="text-3xl">🧮</span>
            <div className="flex-1">
              <div className="font-bold">Quick Calculations</div>
              <div className="text-xs opacity-75">Solve math questions to gather evidence</div>
            </div>
            {quickDone && (
              <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">Done ✓</span>
            )}
          </button>
          <button
            onClick={() => { doCycleMark('math-fieldguide'); navigate('/field-guide'); }}
            disabled={guideDone}
            className={`w-full rounded-xl p-4 md:p-5 text-left border-2 min-h-[64px] text-base md:text-lg transition-all hover:shadow-md flex items-center gap-3 bg-sky-100 border-sky-300 text-sky-800 ${guideDone ? 'opacity-55' : ''}`}
            aria-label="Field Guide — solve and show your work"
          >
            <span className="text-3xl">📓</span>
            <div className="flex-1">
              <div className="font-bold">Field Guide</div>
              <div className="text-xs opacity-75">Solve & document your findings</div>
            </div>
            {guideDone && (
              <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">Done ✓</span>
            )}
          </button>
        </div>
        <button
          onClick={() => setSubMode(null)}
          className="w-full py-3 text-bark-light text-sm font-medium hover:text-forest transition-colors"
        >
          Back to missions
        </button>
        {loading && (
          <div className="flex items-center justify-center py-4">
            <div className="w-8 h-8 border-4 border-forest/20 border-t-forest rounded-full animate-spin" />
          </div>
        )}
      </div>
    );
  }

  // Sub-mode picker for Mixed
  if (subMode === 'mixed-sub') {
    return (
      <div className="p-4 max-w-lg mx-auto space-y-4 animate-slide-up">
        <div className="journal-card bg-white/90 rounded-2xl p-5 shadow-sm">
          <h2 className="font-display text-xl font-bold text-forest mb-1">Mixed Mission</h2>
          <p className="text-sm text-bark-light">Choose your investigation type</p>
        </div>
        <div className="space-y-3">
          <button
            onClick={() => { startQuestionSession('mixed'); }}
            disabled={loading}
            className="w-full rounded-xl p-4 md:p-5 text-left border-2 min-h-[64px] text-base md:text-lg transition-all hover:shadow-md flex items-center gap-3 disabled:opacity-60 bg-amber-100 border-amber-300 text-amber-800"
            aria-label="Full Investigation — mixed questions"
          >
            <span className="text-3xl">🎯</span>
            <div className="flex-1">
              <div className="font-bold">Full Investigation</div>
              <div className="text-xs opacity-75">Answer questions from all subjects</div>
            </div>
          </button>
          <button
            onClick={() => { doCycleMark('math-fieldguide'); navigate('/field-guide'); }}
            className="w-full rounded-xl p-4 md:p-5 text-left border-2 min-h-[64px] text-base md:text-lg transition-all hover:shadow-md flex items-center gap-3 bg-sky-100 border-sky-300 text-sky-800"
            aria-label="Field Guide Challenge — solve and show your work"
          >
            <span className="text-3xl">📓</span>
            <div className="flex-1">
              <div className="font-bold">Field Guide Challenge</div>
              <div className="text-xs opacity-75">Solve & document your findings</div>
            </div>
          </button>
          <button
            onClick={() => { doCycleMark('ela-whispers'); navigate('/spell'); }}
            className="w-full rounded-xl p-4 md:p-5 text-left border-2 min-h-[64px] text-base md:text-lg transition-all hover:shadow-md flex items-center gap-3 bg-indigo-100 border-indigo-300 text-indigo-800"
            aria-label="Cryptid Whispers — listen and write what you hear"
          >
            <span className="text-3xl">👂</span>
            <div className="flex-1">
              <div className="font-bold">Cryptid Whispers</div>
              <div className="text-xs opacity-75">Listen carefully and write what you hear</div>
            </div>
          </button>
        </div>
        <button
          onClick={() => setSubMode(null)}
          className="w-full py-3 text-bark-light text-sm font-medium hover:text-forest transition-colors"
        >
          Back to missions
        </button>
        {loading && (
          <div className="flex items-center justify-center py-4">
            <div className="w-8 h-8 border-4 border-forest/20 border-t-forest rounded-full animate-spin" />
          </div>
        )}
      </div>
    );
  }

  // Sub-mode picker for ELA
  if (subMode === 'ela-sub') {
    const caseDone = cycle.includes('ela-casefile');
    const whispersDone = cycle.includes('ela-whispers');
    return (
      <div className="p-4 max-w-lg mx-auto space-y-4 animate-slide-up">
        {cycleJustReset && (
          <div className="rounded-xl bg-green-100 border-2 border-green-400 text-green-800 p-3 text-center font-bold animate-slide-up">
            All missions complete! New cycle unlocked! 🎉
          </div>
        )}
        <div className="journal-card bg-white/90 rounded-2xl p-5 shadow-sm">
          <h2 className="font-display text-xl font-bold text-forest mb-1">Field Reports</h2>
          <p className="text-sm text-bark-light">Choose your field work</p>
        </div>
        <div className="space-y-3">
          <button
            onClick={() => { doCycleMark('ela-casefile'); startQuestionSession('ela'); }}
            disabled={loading || caseDone}
            className={`w-full rounded-xl p-4 md:p-5 text-left border-2 min-h-[64px] text-base md:text-lg transition-all hover:shadow-md flex items-center gap-3 disabled:opacity-60 bg-purple-100 border-purple-300 text-purple-800 ${caseDone ? 'opacity-55' : ''}`}
            aria-label="Case Files — ELA questions"
          >
            <span className="text-3xl">📝</span>
            <div className="flex-1">
              <div className="font-bold">Case Files</div>
              <div className="text-xs opacity-75">Read and answer to build your case</div>
            </div>
            {caseDone && (
              <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">Done ✓</span>
            )}
          </button>
          <button
            onClick={() => { doCycleMark('ela-whispers'); navigate('/spell'); }}
            disabled={whispersDone}
            className={`w-full rounded-xl p-4 md:p-5 text-left border-2 min-h-[64px] text-base md:text-lg transition-all hover:shadow-md flex items-center gap-3 bg-indigo-100 border-indigo-300 text-indigo-800 ${whispersDone ? 'opacity-55' : ''}`}
            aria-label="Cryptid Whispers — listen and write what you hear"
          >
            <span className="text-3xl">👂</span>
            <div className="flex-1">
              <div className="font-bold">Cryptid Whispers</div>
              <div className="text-xs opacity-75">A cryptid is speaking from the dark... listen carefully and write what you hear</div>
            </div>
            {whispersDone && (
              <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">Done ✓</span>
            )}
          </button>
        </div>
        <button
          onClick={() => setSubMode(null)}
          className="w-full py-3 text-bark-light text-sm font-medium hover:text-forest transition-colors"
        >
          Back to missions
        </button>
        {loading && (
          <div className="flex items-center justify-center py-4">
            <div className="w-8 h-8 border-4 border-forest/20 border-t-forest rounded-full animate-spin" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4 animate-slide-up">
      {cycleJustReset && (
        <div className="rounded-xl bg-green-100 border-2 border-green-400 text-green-800 p-3 text-center font-bold animate-slide-up">
          All missions complete! New cycle unlocked! 🎉
        </div>
      )}

      <div className="journal-card bg-white/90 rounded-2xl p-5 shadow-sm">
        <h2 className="font-display text-xl font-bold text-forest mb-1">Choose Your Mission</h2>
        <p className="text-sm text-bark-light">{getNarrative('session_start')}</p>
      </div>

      <div className="space-y-3">
        {subjects.map(({ id, label, subtitle, icon, color }) => {
          const isRecommended = id === recommended;
          const locked = isSubjectLocked(id);
          return (
            <button
              key={id}
              onClick={() => handleSelect(id)}
              disabled={loading || locked}
              className={`w-full rounded-xl p-4 md:p-5 text-left border-2 min-h-[64px] text-base md:text-lg transition-all hover:shadow-md flex items-center gap-3 disabled:opacity-60 ${color} ${locked ? 'opacity-55' : ''}`}
              aria-label={`Play ${label}${isRecommended ? ' (recommended)' : ''}${locked ? ' (completed this cycle)' : ''}`}
            >
              <span className="text-3xl">{icon}</span>
              <div className="flex-1">
                <div className="font-bold">{label}</div>
                {subtitle && <div className="text-xs opacity-60">{subtitle}</div>}
                {!locked && isRecommended && (
                  <div className="text-xs opacity-75">Recommended for you!</div>
                )}
              </div>
              {locked ? (
                <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  Done ✓
                </span>
              ) : isRecommended ? (
                <span className="bg-gold text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  Hot Lead
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-4">
          <div className="w-8 h-8 border-4 border-forest/20 border-t-forest rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
