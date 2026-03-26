import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../hooks/useGameStore';
import { storage } from '../../lib/storage';
import { SFX } from '../../lib/sfx';

const EQUATIONS_EASY = [
  { eq: '3 + 4 = 7', answer: true },
  { eq: '5 + 2 = 8', answer: false },
  { eq: '8 - 5 = 3', answer: true },
  { eq: '2 + 6 = 9', answer: false },
  { eq: '7 + 3 = 10', answer: true },
  { eq: '4 + 4 = 9', answer: false },
  { eq: '9 - 4 = 5', answer: true },
  { eq: '6 + 3 = 8', answer: false },
  { eq: '10 - 3 = 7', answer: true },
  { eq: '5 + 5 = 11', answer: false },
  { eq: '1 + 8 = 9', answer: true },
  { eq: '7 - 2 = 4', answer: false },
  { eq: '6 + 4 = 10', answer: true },
  { eq: '3 + 3 = 7', answer: false },
  { eq: '8 - 3 = 5', answer: true },
  { eq: '2 + 5 = 8', answer: false },
  { eq: '4 + 5 = 9', answer: true },
  { eq: '9 - 7 = 3', answer: false },
  { eq: '6 + 1 = 7', answer: true },
  { eq: '8 - 6 = 3', answer: false },
];

const EQUATIONS_MEDIUM = [
  { eq: '12 + 7 = 19', answer: true },
  { eq: '15 - 8 = 6', answer: false },
  { eq: '6 + 8 = 14', answer: true },
  { eq: '17 - 9 = 7', answer: false },
  { eq: '9 + 9 = 18', answer: true },
  { eq: '14 - 7 = 8', answer: false },
  { eq: '5 + 8 = 13', answer: true },
  { eq: '11 - 4 = 6', answer: false },
  { eq: '7 + 6 = 13', answer: true },
  { eq: '16 - 8 = 7', answer: false },
  { eq: '8 + 8 = 16', answer: true },
  { eq: '13 - 5 = 7', answer: false },
  { eq: '4 + 9 = 13', answer: true },
  { eq: '15 - 6 = 8', answer: false },
  { eq: '3 + 8 = 11', answer: true },
  { eq: '14 - 6 = 9', answer: false },
  { eq: '9 + 7 = 16', answer: true },
  { eq: '18 - 9 = 8', answer: false },
  { eq: '5 + 7 = 12', answer: true },
  { eq: '11 - 3 = 7', answer: false },
];

const EQUATIONS_HARD = [
  { eq: '24 + 18 = 42', answer: true },
  { eq: '35 - 17 = 19', answer: false },
  { eq: '27 + 15 = 42', answer: true },
  { eq: '43 - 26 = 18', answer: false },
  { eq: '34 + 28 = 62', answer: true },
  { eq: '51 - 24 = 28', answer: false },
  { eq: '19 + 23 = 42', answer: true },
  { eq: '46 - 19 = 28', answer: false },
  { eq: '38 + 14 = 52', answer: true },
  { eq: '62 - 35 = 28', answer: false },
  { eq: '45 + 27 = 72', answer: true },
  { eq: '53 - 28 = 26', answer: false },
  { eq: '29 + 33 = 62', answer: true },
  { eq: '71 - 34 = 38', answer: false },
  { eq: '16 + 37 = 53', answer: true },
  { eq: '44 - 18 = 27', answer: false },
  { eq: '28 + 35 = 63', answer: true },
  { eq: '57 - 29 = 29', answer: false },
  { eq: '33 + 29 = 62', answer: true },
  { eq: '48 - 19 = 30', answer: false },
];

const MAX_QUESTIONS = 25;
const BEST_KEY = 'lv_mythbuster_best';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Phase = 'playing' | 'done';
type Feedback = null | 'correct' | 'wrong';

export function EvidenceShredder() {
  const navigate = useNavigate();
  const [equations] = useState(() => [
    ...shuffle(EQUATIONS_EASY),
    ...shuffle(EQUATIONS_MEDIUM),
    ...shuffle(EQUATIONS_HARD),
  ]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);
  const [phase, setPhase] = useState<Phase>('playing');
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const feedbackTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Countdown timer
  useEffect(() => {
    if (phase !== 'playing') return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setPhase('done');
          return 0;
        }
        if (t <= 10) SFX.tick();
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  const handleAnswer = useCallback(
    (userAnswer: boolean) => {
      if (phase !== 'playing' || feedback !== null) return;
      const correct = userAnswer === equations[currentIdx].answer;
      const newFeedback: Feedback = correct ? 'correct' : 'wrong';
      setFeedback(newFeedback);

      if (correct) {
        SFX.correct();
        setScore((s) => s + 1);
      } else {
        SFX.wrong();
      }

      const newTotalAnswered = totalAnswered + 1;
      setTotalAnswered(newTotalAnswered);

      feedbackTimeout.current = setTimeout(() => {
        setFeedback(null);
        if (newTotalAnswered >= MAX_QUESTIONS) {
          setPhase('done');
        } else {
          setCurrentIdx((i) => (i + 1) % equations.length);
        }
      }, 350);
    },
    [phase, feedback, equations, currentIdx, totalAnswered],
  );

  useEffect(() => {
    return () => {
      if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
    };
  }, []);

  // Done screen: award XP + personal best
  const handleDone = useCallback(() => {
    // Personal best check
    const prevBest = parseInt(localStorage.getItem(BEST_KEY) || '0', 10);
    const newRecord = score > prevBest;
    if (newRecord) localStorage.setItem(BEST_KEY, score.toString());
    setIsNewRecord(newRecord);

    if (newRecord) {
      SFX.fanfare();
    } else {
      SFX.gameOver();
    }

    const xp = 10 + score * 5;
    const store = useGameStore.getState();
    const { profile, progress } = store;
    if (profile) {
      const newProgress = {
        ...progress,
        xp: progress.xp + xp,
        totalXp: progress.totalXp + xp,
        level: Math.floor((progress.totalXp + xp) / 100) + 1,
      };
      storage.setProgress(profile.id, newProgress);
      useGameStore.setState({ progress: newProgress });
    }
  }, [score]);

  // Call handleDone when phase changes to done
  const doneRef = useRef(false);
  useEffect(() => {
    if (phase === 'done' && !doneRef.current) {
      doneRef.current = true;
      handleDone();
    }
  }, [phase, handleDone]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timerStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  const xpEarned = 10 + score * 5;

  if (phase === 'done') {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6 animate-slide-up"
        style={{ background: '#0d1f0d' }}
      >
        <div
          className="rounded-2xl p-8 max-w-sm w-full text-center"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '2px solid rgba(255,184,0,0.4)',
            boxShadow: '0 0 40px rgba(255,184,0,0.15)',
          }}
        >
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="font-display text-3xl font-bold text-gold mb-2">Myths Busted!</h2>
          {isNewRecord && (
            <p className="text-yellow-300 font-display font-bold text-xl mb-2 animate-bounce-in">
              New Record!
            </p>
          )}
          <p className="text-bark-light text-lg mb-1">
            Score: <span className="text-white font-bold">{score}</span> / {totalAnswered}
          </p>
          <p className="text-forest font-bold text-2xl mb-6">+{xpEarned} XP</p>
          <button
            onClick={() => {
              doneRef.current = false;
              setScore(0);
              setTotalAnswered(0);
              setTimeLeft(90);
              setCurrentIdx(0);
              setFeedback(null);
              setIsNewRecord(false);
              setPhase('playing');
            }}
            className="w-full rounded-xl py-4 font-display font-bold text-lg text-white mb-3 transition-all active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #00c896 0%, #00a67a 100%)',
              boxShadow: '0 4px 0 #008060',
            }}
          >
            Play Again
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full rounded-xl py-4 font-display font-bold text-lg text-bark-light transition-all active:scale-95"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1.5px solid rgba(255,255,255,0.15)',
            }}
          >
            Back to Base
          </button>
        </div>
      </div>
    );
  }

  const eq = equations[currentIdx];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0d1f0d' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <button
          onClick={() => navigate('/')}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xl"
          style={{ background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.15)' }}
          aria-label="Back to home"
        >
          ◀
        </button>
        <h1 className="font-display text-xl font-bold text-white" style={{ textShadow: '0 0 20px rgba(0,200,150,0.3)' }}>
          Myth Buster
        </h1>
        <div className="w-10" />
      </div>

      {/* Timer + Score bar */}
      <div className="flex items-center justify-center gap-6 py-3">
        <div
          className={`font-display font-bold text-2xl px-4 py-2 rounded-xl ${timeLeft < 30 ? 'text-red-400 animate-pulse' : 'text-white'}`}
          style={{
            background: timeLeft < 30 ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.08)',
            border: timeLeft < 30 ? '2px solid rgba(239,68,68,0.4)' : '2px solid rgba(255,255,255,0.15)',
          }}
        >
          ⏱ {timerStr}
        </div>
        <span className="font-display text-2xl font-bold text-forest">✓ {score}</span>
        <span className="font-display text-sm text-bark-light">{totalAnswered}/{MAX_QUESTIONS}</span>
      </div>

      {/* Equation card */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div
          className={`rounded-2xl p-8 w-full max-w-md text-center transition-all ${
            feedback === 'wrong' ? 'animate-shake' : ''
          }`}
          style={{
            background: feedback === 'correct' ? 'rgba(0,200,150,0.15)' : 'rgba(255,255,255,0.06)',
            border: '3px solid rgba(255,184,0,0.5)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
            transition: 'background 0.2s',
          }}
        >
          <p className="font-display text-4xl font-bold text-white" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
            {eq.eq}
          </p>
        </div>
      </div>

      {/* True / False buttons */}
      <div className="p-4 space-y-3 max-w-md mx-auto w-full">
        <button
          onClick={() => handleAnswer(true)}
          className="w-full rounded-xl min-h-[80px] font-display font-bold text-2xl text-white flex items-center justify-center gap-3 transition-all active:scale-95 active:translate-y-1"
          style={{
            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            boxShadow: '0 4px 0 #15803d',
          }}
        >
          ✓ TRUE
        </button>
        <button
          onClick={() => handleAnswer(false)}
          className="w-full rounded-xl min-h-[80px] font-display font-bold text-2xl text-white flex items-center justify-center gap-3 transition-all active:scale-95 active:translate-y-1"
          style={{
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            boxShadow: '0 4px 0 #b91c1c',
          }}
        >
          ✕ FALSE
        </button>
      </div>
    </div>
  );
}
