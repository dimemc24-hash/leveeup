import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../hooks/useGameStore';
import { storage } from '../../lib/storage';
import { SFX } from '../../lib/sfx';
import { sortingRounds, type SortingRound } from '../../data/sortingItems';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRounds(): SortingRound[] {
  const shuffled = shuffle(sortingRounds);
  return shuffled.slice(0, 5).map((r) => ({
    ...r,
    items: shuffle(r.items),
  }));
}

type Phase = 'playing' | 'done';
type Feedback = null | 'correct' | 'wrong';
type FlyDirection = 'left' | 'right' | null;

export function CreatureFeature() {
  const navigate = useNavigate();
  const [rounds, setRounds] = useState<SortingRound[]>(() => pickRounds());
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);
  const [currentItemIdx, setCurrentItemIdx] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalSorted, setTotalSorted] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [phase, setPhase] = useState<Phase>('playing');
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [flyDirection, setFlyDirection] = useState<FlyDirection>(null);
  const [roundToast, setRoundToast] = useState(false);
  const feedbackTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const doneRef = useRef(false);

  // Countdown timer
  useEffect(() => {
    if (phase !== 'playing') return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setPhase('done');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  const advanceItem = useCallback(() => {
    const round = rounds[currentRoundIdx];
    if (currentItemIdx + 1 < round.items.length) {
      setCurrentItemIdx((i) => i + 1);
    } else {
      // Round complete
      if (currentRoundIdx + 1 < rounds.length) {
        setRoundToast(true);
        setTimeout(() => {
          setRoundToast(false);
          setCurrentRoundIdx((r) => r + 1);
          setCurrentItemIdx(0);
        }, 1000);
      } else {
        setPhase('done');
      }
    }
  }, [rounds, currentRoundIdx, currentItemIdx]);

  const handleSort = useCallback(
    (bin: 'A' | 'B') => {
      if (phase !== 'playing' || feedback !== null || roundToast) return;
      const round = rounds[currentRoundIdx];
      const item = round.items[currentItemIdx];
      const isCorrect = item.category === bin;
      const direction: FlyDirection = bin === 'A' ? 'left' : 'right';

      setTotalSorted((n) => n + 1);

      if (isCorrect) {
        SFX.correct();
        setCorrectCount((c) => c + 1);
        setFeedback('correct');
        setFlyDirection(direction);

        feedbackTimeout.current = setTimeout(() => {
          setFeedback(null);
          setFlyDirection(null);
          advanceItem();
        }, 400);
      } else {
        SFX.wrong();
        setFeedback('wrong');

        // After 500ms, fly to correct bin
        feedbackTimeout.current = setTimeout(() => {
          const correctDirection: FlyDirection = item.category === 'A' ? 'left' : 'right';
          setFlyDirection(correctDirection);
          setTimeout(() => {
            setFeedback(null);
            setFlyDirection(null);
            advanceItem();
          }, 350);
        }, 500);
      }
    },
    [phase, feedback, roundToast, rounds, currentRoundIdx, currentItemIdx, advanceItem],
  );

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
    };
  }, []);

  // Award XP when done
  const handleDone = useCallback(() => {
    const xp = 15 + correctCount * 2;
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
  }, [correctCount]);

  useEffect(() => {
    if (phase === 'done' && !doneRef.current) {
      doneRef.current = true;
      handleDone();
    }
  }, [phase, handleDone]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timerStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  const xpEarned = 15 + correctCount * 2;
  const roundsCompleted = phase === 'done' && currentRoundIdx < rounds.length - 1
    ? currentRoundIdx + 1
    : phase === 'done'
      ? rounds.length
      : currentRoundIdx + 1;

  // Done screen
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
          <div className="text-5xl mb-4">🦎</div>
          <h2 className="font-display text-3xl font-bold text-gold mb-2">Creatures Sorted!</h2>
          <p className="text-bark-light text-sm mb-1">
            Rounds completed: <span className="text-white font-bold">{roundsCompleted} / {rounds.length}</span>
          </p>
          <p className="text-bark-light text-lg mb-1">
            Correct: <span className="text-white font-bold">{correctCount}</span> / {totalSorted}
          </p>
          <p className="text-forest font-bold text-2xl mb-6">+{xpEarned} XP</p>
          <button
            onClick={() => {
              doneRef.current = false;
              setRounds(pickRounds());
              setCurrentRoundIdx(0);
              setCurrentItemIdx(0);
              setCorrectCount(0);
              setTotalSorted(0);
              setTimeLeft(120);
              setFeedback(null);
              setFlyDirection(null);
              setRoundToast(false);
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

  const round = rounds[currentRoundIdx];
  const item = round.items[currentItemIdx];

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
        <h1
          className="font-display text-xl font-bold text-white"
          style={{ textShadow: '0 0 20px rgba(0,200,150,0.3)' }}
        >
          Creature Feature
        </h1>
        <div className="w-10" />
      </div>

      {/* Round indicator + Timer + Score */}
      <div className="flex items-center justify-center gap-4 py-2">
        <span className="font-display text-sm font-bold text-bark-light">
          Round {currentRoundIdx + 1} / {rounds.length}
        </span>
        <div
          className={`font-display font-bold text-xl px-4 py-1.5 rounded-xl ${timeLeft < 30 ? 'text-red-400 animate-pulse' : 'text-white'}`}
          style={{
            background: timeLeft < 30 ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.08)',
            border: timeLeft < 30 ? '2px solid rgba(239,68,68,0.4)' : '2px solid rgba(255,255,255,0.15)',
          }}
        >
          ⏱ {timerStr}
        </div>
        <span className="font-display text-xl font-bold text-forest">✓ {correctCount}</span>
      </div>

      {/* Round toast */}
      {roundToast && (
        <div className="flex items-center justify-center py-4 animate-bounce-in">
          <div
            className="px-6 py-3 rounded-2xl font-display font-bold text-lg text-gold"
            style={{
              background: 'rgba(255,184,0,0.15)',
              border: '2px solid rgba(255,184,0,0.4)',
              boxShadow: '0 0 24px rgba(255,184,0,0.15)',
            }}
          >
            Round Complete!
          </div>
        </div>
      )}

      {/* Item card area */}
      {!roundToast && (
        <div className="flex-1 flex items-center justify-center px-4">
          <div
            className={`rounded-2xl p-8 w-full max-w-md text-center ${
              feedback === 'wrong' ? 'animate-shake' : ''
            }`}
            style={{
              background:
                feedback === 'correct'
                  ? 'rgba(0,200,150,0.15)'
                  : feedback === 'wrong'
                    ? 'rgba(239,68,68,0.12)'
                    : 'rgba(255,255,255,0.06)',
              border: '3px solid rgba(255,184,0,0.5)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
              transform:
                flyDirection === 'left'
                  ? 'translateX(-40vw) scale(0.5)'
                  : flyDirection === 'right'
                    ? 'translateX(40vw) scale(0.5)'
                    : 'none',
              transition: 'transform 0.3s ease-out, opacity 0.3s',
              opacity: flyDirection ? 0 : 1,
            }}
          >
            <p className="text-bark-light text-xs mb-2 font-bold uppercase tracking-wider">
              Sort this item
            </p>
            <p
              className="font-display text-4xl font-bold text-white"
              style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
            >
              {item.text}
            </p>
            <p className="text-bark-light text-xs mt-3">
              Item {currentItemIdx + 1} / {round.items.length}
            </p>
          </div>
        </div>
      )}

      {/* Category bins */}
      <div className="p-4 flex gap-3 max-w-lg mx-auto w-full">
        {/* Category A — LEFT */}
        <button
          onClick={() => handleSort('A')}
          className="flex-1 rounded-xl min-h-[90px] font-display font-bold text-lg text-white flex flex-col items-center justify-center gap-1 transition-all active:scale-95 active:translate-y-1"
          style={{
            background: 'rgba(0,40,20,0.8)',
            border: '3px solid rgba(0,200,150,0.6)',
            boxShadow: '0 4px 0 rgba(0,100,60,0.5), 0 0 16px rgba(0,200,150,0.1)',
          }}
        >
          <span className="text-xs text-forest uppercase tracking-wider">◀</span>
          <span>{round.categoryA}</span>
        </button>
        {/* Category B — RIGHT */}
        <button
          onClick={() => handleSort('B')}
          className="flex-1 rounded-xl min-h-[90px] font-display font-bold text-lg text-white flex flex-col items-center justify-center gap-1 transition-all active:scale-95 active:translate-y-1"
          style={{
            background: 'rgba(40,30,0,0.8)',
            border: '3px solid rgba(255,184,0,0.6)',
            boxShadow: '0 4px 0 rgba(150,100,0,0.5), 0 0 16px rgba(255,184,0,0.1)',
          }}
        >
          <span className="text-xs text-gold uppercase tracking-wider">▶</span>
          <span>{round.categoryB}</span>
        </button>
      </div>
    </div>
  );
}
