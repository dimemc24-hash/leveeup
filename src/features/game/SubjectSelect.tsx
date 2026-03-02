import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../hooks/useGameStore';
import { useTheme } from '../themes/engine/ThemeContext';
import { getQuestionsForSession, getRecommendedSubject } from '../../lib/questions';
import type { Subject } from '../../types';

const subjects: { id: Subject | 'mixed'; label: string; icon: string; color: string }[] = [
  { id: 'math', label: 'Math', icon: '🔢', color: 'bg-blue-100 border-blue-300 text-blue-800' },
  { id: 'ela', label: 'Reading & Writing', icon: '📚', color: 'bg-purple-100 border-purple-300 text-purple-800' },
  { id: 'science', label: 'Science', icon: '🔬', color: 'bg-green-100 border-green-300 text-green-800' },
  { id: 'social_studies', label: 'Social Studies', icon: '🗺️', color: 'bg-amber-100 border-amber-300 text-amber-800' },
  { id: 'mixed', label: 'Mixed Mission', icon: '🎯', color: 'bg-forest/10 border-forest text-forest' },
];

export function SubjectSelect() {
  const navigate = useNavigate();
  const { progress, startSession } = useGameStore();
  const { getNarrative } = useTheme();

  const recommended = getRecommendedSubject(progress.standardProgress);

  const handleSelect = (subject: Subject | 'mixed') => {
    const questions = getQuestionsForSession(subject, progress.standardProgress, 10);
    if (questions.length === 0) return;
    startSession(questions, subject);
    navigate('/play/session');
  };

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4 animate-slide-up">
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-paper-dark">
        <h2 className="font-display text-xl font-bold text-forest mb-1">Choose Your Mission</h2>
        <p className="text-sm text-bark-light">{getNarrative('session_start')}</p>
      </div>

      <div className="space-y-3">
        {subjects.map(({ id, label, icon, color }) => {
          const isRecommended = id === recommended;
          return (
            <button
              key={id}
              onClick={() => handleSelect(id)}
              className={`w-full rounded-xl p-4 text-left border-2 transition-all hover:shadow-md flex items-center gap-3 ${color}`}
              aria-label={`Play ${label}${isRecommended ? ' (recommended)' : ''}`}
            >
              <span className="text-2xl">{icon}</span>
              <div className="flex-1">
                <div className="font-bold">{label}</div>
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
    </div>
  );
}
