import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useGameStore } from '../../hooks/useGameStore';
import { cryptidRoster } from '../themes/cryptids/cryptidTheme';
import { SFX } from '../../lib/sfx';
import { Confetti } from '../../components/Confetti';

export function ResultsScreen() {
  const { session, progress, endSession } = useGameStore();
  const pendingCryptid = progress.pendingCapture ? cryptidRoster.find((c) => c.id === progress.pendingCapture) : null;

  // Use session data before clearing
  const answers = session?.answers ?? [];
  const total = answers.length;
  const correct = answers.filter((a) => a.correct).length;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const xpEarned = answers.reduce((sum, a) => sum + a.xpEarned, 0);

  const [showConfetti] = useState(() => accuracy >= 90);
  const [displayXP, setDisplayXP] = useState(0);
  const hasPlayedSfx = useRef(false);

  useEffect(() => {
    if (hasPlayedSfx.current) return;
    hasPlayedSfx.current = true;
    SFX.gameOver();
    setTimeout(() => SFX.xpGain(), 500);
  }, []);

  useEffect(() => {
    if (xpEarned === 0) return;
    const duration = 1500;
    const steps = 30;
    const stepTime = duration / steps;
    let current = 0;
    const increment = xpEarned / steps;
    const interval = setInterval(() => {
      current += increment;
      if (current >= xpEarned) {
        setDisplayXP(xpEarned);
        clearInterval(interval);
      } else {
        setDisplayXP(Math.round(current));
      }
    }, stepTime);
    return () => clearInterval(interval);
  }, [xpEarned]);

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
          <div className="text-2xl font-bold text-forest-light">+{displayXP}</div>
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

      {/* Pending capture prompt */}
      {pendingCryptid && (
        <Link
          to="/dungeon"
          onClick={() => endSession()}
          className="block rounded-2xl p-4 text-center transition-all hover:scale-[1.01] active:scale-[0.99]"
          style={{
            background: 'linear-gradient(135deg, rgba(255,184,0,0.15) 0%, rgba(255,140,0,0.1) 100%)',
            border: '2px solid rgba(255,184,0,0.4)',
            boxShadow: '0 0 30px rgba(255,184,0,0.15)',
          }}
        >
          <p className="font-display font-bold text-gold text-lg">Investigation Complete!</p>
          <p className="text-bark-light text-sm mt-1">Head to Flashlight Hunt to capture the {pendingCryptid.name}!</p>
          <div
            className="mt-3 rounded-xl py-2.5 font-display font-bold text-sm text-white"
            style={{ background: 'linear-gradient(135deg, #FFB800 0%, #FF8C00 100%)', boxShadow: '0 2px 0 #CC7000' }}
          >
            Enter Flashlight Hunt
          </div>
        </Link>
      )}

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

      {showConfetti && <Confetti />}
    </div>
  );
}
