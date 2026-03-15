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

type SubMode = 'math-sub' | 'ela-sub' | null;

export function SubjectSelect() {
  const navigate = useNavigate();
  const { progress, startSession } = useGameStore();
  const { getNarrative } = useTheme();
  const [loading, setLoading] = useState(false);
  const [subMode, setSubMode] = useState<SubMode>(null);

  const recommended = getRecommendedSubject(progress.standardProgress);

  const handleSelect = async (subject: Subject | 'mixed') => {
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
    // Other subjects go directly to question flow
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
    return (
      <div className="p-4 max-w-lg mx-auto space-y-4 animate-slide-up">
        <div className="journal-card bg-white/90 rounded-2xl p-5 shadow-sm">
          <h2 className="font-display text-xl font-bold text-forest mb-1">Evidence Analysis</h2>
          <p className="text-sm text-bark-light">Choose your analysis method</p>
        </div>
        <div className="space-y-3">
          <button
            onClick={() => startQuestionSession('math')}
            disabled={loading}
            className="w-full rounded-xl p-4 md:p-5 text-left border-2 min-h-[64px] text-base md:text-lg transition-all hover:shadow-md flex items-center gap-3 disabled:opacity-60 bg-blue-100 border-blue-300 text-blue-800"
            aria-label="Quick Calculations — math questions"
          >
            <span className="text-3xl">🧮</span>
            <div className="flex-1">
              <div className="font-bold">Quick Calculations</div>
              <div className="text-xs opacity-75">Solve math questions to gather evidence</div>
            </div>
          </button>
          <button
            onClick={() => navigate('/field-guide')}
            className="w-full rounded-xl p-4 md:p-5 text-left border-2 min-h-[64px] text-base md:text-lg transition-all hover:shadow-md flex items-center gap-3 bg-sky-100 border-sky-300 text-sky-800"
            aria-label="Field Guide — solve and show your work"
          >
            <span className="text-3xl">📓</span>
            <div className="flex-1">
              <div className="font-bold">Field Guide</div>
              <div className="text-xs opacity-75">Solve & document your findings</div>
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
    return (
      <div className="p-4 max-w-lg mx-auto space-y-4 animate-slide-up">
        <div className="journal-card bg-white/90 rounded-2xl p-5 shadow-sm">
          <h2 className="font-display text-xl font-bold text-forest mb-1">Field Reports</h2>
          <p className="text-sm text-bark-light">Choose your field work</p>
        </div>
        <div className="space-y-3">
          <button
            onClick={() => startQuestionSession('ela')}
            disabled={loading}
            className="w-full rounded-xl p-4 md:p-5 text-left border-2 min-h-[64px] text-base md:text-lg transition-all hover:shadow-md flex items-center gap-3 disabled:opacity-60 bg-purple-100 border-purple-300 text-purple-800"
            aria-label="Case Files — ELA questions"
          >
            <span className="text-3xl">📝</span>
            <div className="flex-1">
              <div className="font-bold">Case Files</div>
              <div className="text-xs opacity-75">Read and answer to build your case</div>
            </div>
          </button>
          <button
            onClick={() => navigate('/spell')}
            className="w-full rounded-xl p-4 md:p-5 text-left border-2 min-h-[64px] text-base md:text-lg transition-all hover:shadow-md flex items-center gap-3 bg-indigo-100 border-indigo-300 text-indigo-800"
            aria-label="Cryptid Whispers — listen and write what you hear"
          >
            <span className="text-3xl">👂</span>
            <div className="flex-1">
              <div className="font-bold">Cryptid Whispers</div>
              <div className="text-xs opacity-75">A cryptid is speaking from the dark... listen carefully and write what you hear</div>
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

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4 animate-slide-up">
      <div className="journal-card bg-white/90 rounded-2xl p-5 shadow-sm">
        <h2 className="font-display text-xl font-bold text-forest mb-1">Choose Your Mission</h2>
        <p className="text-sm text-bark-light">{getNarrative('session_start')}</p>
      </div>

      <div className="space-y-3">
        {subjects.map(({ id, label, subtitle, icon, color }) => {
          const isRecommended = id === recommended;
          return (
            <button
              key={id}
              onClick={() => handleSelect(id)}
              disabled={loading}
              className={`w-full rounded-xl p-4 md:p-5 text-left border-2 min-h-[64px] text-base md:text-lg transition-all hover:shadow-md flex items-center gap-3 disabled:opacity-60 ${color}`}
              aria-label={`Play ${label}${isRecommended ? ' (recommended)' : ''}`}
            >
              <span className="text-3xl">{icon}</span>
              <div className="flex-1">
                <div className="font-bold">{label}</div>
                {subtitle && <div className="text-xs opacity-60">{subtitle}</div>}
                {isRecommended && (
                  <div className="text-xs opacity-75">Recommended for you!</div>
                )}
              </div>
              {isRecommended && (
                <span className="bg-gold text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  Hot Lead
                </span>
              )}
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
