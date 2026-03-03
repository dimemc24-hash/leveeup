import { Link } from 'react-router-dom';
import { useGameStore } from '../../hooks/useGameStore';

export function ResultsScreen() {
  const { session, progress, endSession } = useGameStore();

  // Use session data before clearing
  const answers = session?.answers ?? [];
  const total = answers.length;
  const correct = answers.filter((a) => a.correct).length;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const xpEarned = answers.reduce((sum, a) => sum + a.xpEarned, 0);

  const getMessage = () => {
    if (accuracy >= 90) return 'Master Investigator! Outstanding work!';
    if (accuracy >= 70) return 'Great detective work! Keep it up!';
    if (accuracy >= 50) return 'Good effort! Every clue counts!';
    return 'Keep investigating! Practice makes perfect!';
  };

  const getEmoji = () => {
    if (accuracy >= 90) return '🏆';
    if (accuracy >= 70) return '⭐';
    if (accuracy >= 50) return '👍';
    return '💪';
  };

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4 animate-slide-up">
      <div className="journal-card bg-white/90 rounded-2xl p-6 shadow-sm text-center">
        <div className="text-5xl mb-3 animate-bounce-in">{getEmoji()}</div>
        <h2 className="font-display text-2xl font-bold text-forest mb-2">Mission Complete!</h2>
        <p className="text-bark-light">{getMessage()}</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="journal-card bg-white/90 rounded-xl p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-forest">{correct}/{total}</div>
          <div className="text-xs text-bark-light">Correct</div>
        </div>
        <div className="journal-card bg-white/90 rounded-xl p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-gold">{accuracy}%</div>
          <div className="text-xs text-bark-light">Accuracy</div>
        </div>
        <div className="journal-card bg-white/90 rounded-xl p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-forest-light">+{xpEarned}</div>
          <div className="text-xs text-bark-light">XP Earned</div>
        </div>
      </div>

      {/* Answer summary */}
      <div className="journal-card bg-white/90 rounded-2xl p-4 shadow-sm">
        <h3 className="font-display font-bold text-forest mb-3">Investigation Log</h3>
        <div className="space-y-2">
          {answers.map((a, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${a.correct ? 'bg-forest-light' : 'bg-danger'}`}>
                {a.correct ? '✓' : '✗'}
              </span>
              <span className="text-bark-light">Question {i + 1}</span>
              <span className="ml-auto text-gold font-bold">+{a.xpEarned} XP</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Link
          to="/play"
          onClick={() => endSession()}
          className="flex-1 bg-forest text-white rounded-xl p-4 text-center font-bold text-lg min-h-[56px] flex items-center justify-center hover:bg-forest-light transition-colors shadow-md"
          aria-label="Play again"
        >
          New Mission
        </Link>
        <Link
          to="/"
          onClick={() => endSession()}
          className="flex-1 border-2 border-forest text-forest rounded-xl p-4 text-center font-bold text-lg min-h-[56px] flex items-center justify-center hover:bg-forest/5 transition-colors"
          aria-label="Go to home"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
