import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../hooks/useGameStore';
import { storage } from '../../lib/storage';
import { SFX } from '../../lib/sfx';
import { builderPuzzles, type BuilderPuzzle } from '../../data/builderPuzzles';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickPuzzles(): BuilderPuzzle[] {
  return shuffle(builderPuzzles).slice(0, 10);
}

type Phase = 'playing' | 'done';

export function SwampBuilder() {
  const navigate = useNavigate();
  const [puzzles, setPuzzles] = useState(() => pickPuzzles());
  const [currentPuzzleIdx, setCurrentPuzzleIdx] = useState(0);
  const [placed, setPlaced] = useState<string[]>([]);
  const [available, setAvailable] = useState<string[]>(() => shuffle([...puzzles[0].pieces]));
  const [score, setScore] = useState(0);
  const [perfectPuzzles, setPerfectPuzzles] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);
  const [phase, setPhase] = useState<Phase>('playing');
  const [wrongShake, setWrongShake] = useState<string | null>(null);
  const [hadError, setHadError] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const shakeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentPuzzle = puzzles[currentPuzzleIdx];

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

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (shakeTimeout.current) clearTimeout(shakeTimeout.current);
      if (completeTimeout.current) clearTimeout(completeTimeout.current);
    };
  }, []);

  const advanceToNext = useCallback(() => {
    const nextIdx = currentPuzzleIdx + 1;
    if (nextIdx >= puzzles.length) {
      setPhase('done');
    } else {
      setCurrentPuzzleIdx(nextIdx);
      setPlaced([]);
      setAvailable(shuffle([...puzzles[nextIdx].pieces]));
      setHadError(false);
      setShowComplete(false);
    }
  }, [currentPuzzleIdx, puzzles]);

  const handleTap = useCallback(
    (piece: string, idx: number) => {
      if (phase !== 'playing' || showComplete) return;

      const expectedPiece = currentPuzzle.pieces[placed.length];

      if (piece === expectedPiece) {
        SFX.correct();
        const newPlaced = [...placed, piece];
        const newAvailable = available.filter((_, i) => i !== idx);
        setPlaced(newPlaced);
        setAvailable(newAvailable);

        // Check if puzzle is complete
        if (newPlaced.length === currentPuzzle.pieces.length) {
          setScore((s) => s + 1);
          if (!hadError) {
            setPerfectPuzzles((p) => p + 1);
          }
          setShowComplete(true);
          SFX.fanfare();
          completeTimeout.current = setTimeout(() => {
            advanceToNext();
          }, 1000);
        }
      } else {
        SFX.wrong();
        setHadError(true);
        setWrongShake(`${idx}-${piece}`);
        shakeTimeout.current = setTimeout(() => {
          setWrongShake(null);
        }, 500);
      }
    },
    [phase, showComplete, currentPuzzle, placed, available, hadError, advanceToNext],
  );

  // Award XP on done
  const doneRef = useRef(false);
  const xpEarned = 10 + score * 10 + perfectPuzzles * 2;

  const handleDone = useCallback(() => {
    const xp = 10 + score * 10 + perfectPuzzles * 2;
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
  }, [score, perfectPuzzles]);

  useEffect(() => {
    if (phase === 'done' && !doneRef.current) {
      doneRef.current = true;
      handleDone();
    }
  }, [phase, handleDone]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timerStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  const isMath = currentPuzzle.subject === 'math';
  const borderColor = isMath ? 'rgba(255,184,0,0.5)' : 'rgba(0,200,150,0.5)';

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
          <div className="text-5xl mb-4">🧱</div>
          <h2 className="font-display text-3xl font-bold text-gold mb-2">Swamp Built!</h2>
          <p className="text-bark-light text-lg mb-1">
            Puzzles: <span className="text-white font-bold">{score}</span> / {puzzles.length}
          </p>
          <p className="text-forest font-bold text-2xl mb-6">+{xpEarned} XP</p>
          <button
            onClick={() => {
              doneRef.current = false;
              const newPuzzles = pickPuzzles();
              setPuzzles(newPuzzles);
              setCurrentPuzzleIdx(0);
              setPlaced([]);
              setAvailable(shuffle([...newPuzzles[0].pieces]));
              setScore(0);
              setPerfectPuzzles(0);
              setTimeLeft(90);
              setHadError(false);
              setShowComplete(false);
              setWrongShake(null);
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
          Swamp Builder
        </h1>
        <div className="w-10" />
      </div>

      {/* Timer + progress */}
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
        <span className="font-display text-2xl font-bold text-forest">
          {currentPuzzleIdx + 1}/{puzzles.length}
        </span>
      </div>

      {/* Puzzle type indicator */}
      <div className="text-center mb-2">
        <span
          className="inline-block px-3 py-1 rounded-full text-xs font-bold"
          style={{
            background: isMath ? 'rgba(255,184,0,0.15)' : 'rgba(0,200,150,0.15)',
            color: isMath ? '#FFB800' : '#00c896',
            border: `1px solid ${borderColor}`,
          }}
        >
          {isMath ? 'Math Equation' : 'Sentence'}
        </span>
      </div>

      {/* Build zone — placed pieces + placeholders */}
      <div className="px-4 py-4">
        <div
          className="rounded-2xl p-4 min-h-[80px] flex flex-wrap items-center justify-center gap-2"
          style={{
            background: showComplete ? 'rgba(0,200,150,0.12)' : 'rgba(255,255,255,0.04)',
            border: showComplete ? '2px solid rgba(0,200,150,0.5)' : '2px dashed rgba(255,255,255,0.15)',
            boxShadow: showComplete ? '0 0 30px rgba(0,200,150,0.2)' : 'none',
            transition: 'all 0.3s',
          }}
        >
          {showComplete ? (
            <p
              className="font-display text-2xl font-bold text-white animate-bounce-in"
              style={{ textShadow: '0 0 16px rgba(0,200,150,0.4)' }}
            >
              {currentPuzzle.display}
            </p>
          ) : (
            currentPuzzle.pieces.map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-center"
              >
                {i < placed.length ? (
                  <span
                    className="rounded-full px-4 py-3 font-display font-bold text-white text-lg animate-bounce-in"
                    style={{
                      background: isMath ? 'rgba(255,184,0,0.2)' : 'rgba(0,200,150,0.2)',
                      border: `2px solid ${borderColor}`,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    }}
                  >
                    {placed[i]}
                  </span>
                ) : (
                  <span
                    className="rounded-full px-4 py-3 text-lg"
                    style={{
                      border: '2px dashed rgba(255,255,255,0.2)',
                      color: 'rgba(255,255,255,0.2)',
                      minWidth: '48px',
                      textAlign: 'center',
                    }}
                  >
                    ?
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Available pieces */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="flex flex-wrap justify-center gap-3 max-w-md">
          {available.map((piece, idx) => {
            const shakeKey = `${idx}-${piece}`;
            const isShaking = wrongShake === shakeKey;
            return (
              <button
                key={`${idx}-${piece}`}
                onClick={() => handleTap(piece, idx)}
                className={`rounded-full px-4 py-3 font-display font-bold text-lg text-white transition-all active:scale-90 ${
                  isShaking ? 'animate-shake' : ''
                }`}
                style={{
                  background: isMath ? 'rgba(255,184,0,0.12)' : 'rgba(0,200,150,0.12)',
                  border: `2.5px solid ${borderColor}`,
                  boxShadow: `0 4px 0 ${isMath ? 'rgba(255,140,0,0.4)' : 'rgba(0,160,100,0.4)'}, 0 4px 16px rgba(0,0,0,0.2)`,
                }}
              >
                {piece}
              </button>
            );
          })}
        </div>
      </div>

      {/* Score bar at bottom */}
      <div className="p-4 text-center">
        <span className="text-bark-light text-sm">
          Score: <span className="text-white font-bold">{score}</span> | Perfect: <span className="text-gold font-bold">{perfectPuzzles}</span>
        </span>
      </div>
    </div>
  );
}
