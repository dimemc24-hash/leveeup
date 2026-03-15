import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../hooks/useGameStore';
import { storage } from '../../lib/storage';

const WORDS = [
  'swamp', 'beast', 'track', 'crypt', 'ghost', 'feral',
  'marsh', 'bayou', 'creek', 'slime', 'spook', 'gator',
  'haunt', 'prowl', 'murky', 'growl',
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function randomLetters(exclude: string, count: number): string[] {
  const letters: string[] = [];
  const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  while (letters.length < count) {
    const ch = alpha[Math.floor(Math.random() * 26)];
    if (ch !== exclude.toUpperCase() && !letters.includes(ch)) {
      letters.push(ch);
    }
  }
  return letters;
}

interface WordPuzzle {
  word: string;
  hiddenIndices: number[];
  // For each hidden index, the button choices (shuffled, includes correct)
  choices: Map<number, string[]>;
}

function generatePuzzle(word: string): WordPuzzle {
  const letters = word.split('');
  const numHidden = Math.max(1, Math.round(letters.length * 0.4));
  const indices = shuffle(letters.map((_, i) => i)).slice(0, numHidden).sort((a, b) => a - b);

  const choices = new Map<number, string[]>();
  for (const idx of indices) {
    const correct = letters[idx].toUpperCase();
    const distractors = randomLetters(letters[idx], 3);
    choices.set(idx, shuffle([correct, ...distractors]));
  }

  return { word, hiddenIndices: indices, choices };
}

type Phase = 'playing' | 'done';

export function CryptidCaller() {
  const navigate = useNavigate();
  const puzzles = useMemo(() => shuffle(WORDS).slice(0, 10).map(generatePuzzle), []);
  const [wordIdx, setWordIdx] = useState(0);
  const [filledSlots, setFilledSlots] = useState<Record<number, string>>({});
  const [currentBlankIdx, setCurrentBlankIdx] = useState(0);
  const [shakeBtn, setShakeBtn] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(120);
  const [phase, setPhase] = useState<Phase>('playing');
  const [completed, setCompleted] = useState(0);
  const shakeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Countdown
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

  const puzzle = puzzles[wordIdx];
  const currentHiddenPos = puzzle?.hiddenIndices[currentBlankIdx];
  const currentChoices = currentHiddenPos !== undefined ? puzzle.choices.get(currentHiddenPos) : undefined;

  const advanceWord = useCallback(() => {
    const nextWord = wordIdx + 1;
    if (nextWord >= puzzles.length) {
      setPhase('done');
    } else {
      setWordIdx(nextWord);
      setFilledSlots({});
      setCurrentBlankIdx(0);
    }
  }, [wordIdx, puzzles.length]);

  const handleLetterTap = useCallback(
    (letter: string) => {
      if (phase !== 'playing' || currentHiddenPos === undefined || toast) return;

      const correctLetter = puzzle.word[currentHiddenPos].toUpperCase();
      if (letter === correctLetter) {
        const newFilled = { ...filledSlots, [currentHiddenPos]: letter };
        setFilledSlots(newFilled);
        const nextBlank = currentBlankIdx + 1;

        if (nextBlank >= puzzle.hiddenIndices.length) {
          // Word complete
          setCompleted((c) => c + 1);
          setToast('Great work! +8 XP');
          toastTimeout.current = setTimeout(() => {
            setToast(null);
            advanceWord();
          }, 1500);
        } else {
          setCurrentBlankIdx(nextBlank);
        }
      } else {
        // Wrong tap — shake
        setShakeBtn(letter);
        shakeTimeout.current = setTimeout(() => setShakeBtn(null), 300);
      }
    },
    [phase, currentHiddenPos, puzzle, filledSlots, currentBlankIdx, advanceWord, toast],
  );

  useEffect(() => {
    return () => {
      if (shakeTimeout.current) clearTimeout(shakeTimeout.current);
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
    };
  }, []);

  // Award XP on done
  const doneRef = useRef(false);
  useEffect(() => {
    if (phase === 'done' && !doneRef.current) {
      doneRef.current = true;
      const xp = 15 + completed * 8;
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
    }
  }, [phase, completed]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timerStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  const xpEarned = 15 + completed * 8;

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
          <div className="text-5xl mb-4">📡</div>
          <h2 className="font-display text-3xl font-bold text-gold mb-2">Signal Received!</h2>
          <p className="text-bark-light text-lg mb-1">
            Words decoded: <span className="text-white font-bold">{completed}</span> / 10
          </p>
          <p className="text-forest font-bold text-2xl mb-6">+{xpEarned} XP</p>
          <button
            onClick={() => window.location.reload()}
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
          Cryptid Caller
        </h1>
        <div
          className={`font-display font-bold text-xl ${timeLeft < 30 ? 'text-red-400 animate-pulse' : 'text-forest'}`}
        >
          {timerStr}
        </div>
      </div>

      {/* Progress */}
      <div className="text-center py-2">
        <span className="text-bark-light text-sm">Word {wordIdx + 1} / 10</span>
      </div>

      {/* Word display */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 relative">
        {/* Toast */}
        {toast && (
          <div
            className="absolute top-4 left-1/2 -translate-x-1/2 rounded-xl px-6 py-3 font-display font-bold text-forest text-lg animate-bounce-in z-10"
            style={{
              background: 'rgba(0,200,150,0.15)',
              border: '2px solid rgba(0,200,150,0.4)',
              boxShadow: '0 0 20px rgba(0,200,150,0.2)',
            }}
          >
            {toast}
          </div>
        )}

        {/* Letter slots */}
        <div className="flex gap-3 mb-10">
          {puzzle.word.split('').map((letter, i) => {
            const isHidden = puzzle.hiddenIndices.includes(i);
            const isFilled = isHidden && filledSlots[i] !== undefined;
            const isCurrent = i === currentHiddenPos;
            return (
              <div
                key={i}
                className={`w-14 h-16 rounded-xl flex items-center justify-center font-display text-3xl font-bold transition-all ${
                  isFilled ? 'animate-bounce-in' : ''
                }`}
                style={{
                  background: isFilled
                    ? 'rgba(255,184,0,0.2)'
                    : isHidden
                      ? 'rgba(255,255,255,0.08)'
                      : 'rgba(255,255,255,0.04)',
                  border: isCurrent
                    ? '2.5px solid rgba(255,184,0,0.7)'
                    : isFilled
                      ? '2px solid rgba(255,184,0,0.4)'
                      : '1.5px solid rgba(255,255,255,0.1)',
                  color: isFilled ? '#FFB800' : isHidden ? '#94a3b8' : '#e8edf4',
                  boxShadow: isCurrent ? '0 0 12px rgba(255,184,0,0.2)' : undefined,
                }}
              >
                {isHidden ? (isFilled ? filledSlots[i] : '?') : letter.toUpperCase()}
              </div>
            );
          })}
        </div>

        {/* Choice buttons */}
        {currentChoices && (
          <div className="grid grid-cols-4 gap-3 max-w-xs">
            {currentChoices.map((ch) => (
              <button
                key={ch}
                onClick={() => handleLetterTap(ch)}
                className={`w-16 h-16 rounded-xl font-display text-2xl font-bold text-white flex items-center justify-center transition-all active:scale-90 ${
                  shakeBtn === ch ? 'animate-shake' : ''
                }`}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '2px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 3px 0 rgba(0,0,0,0.3)',
                }}
              >
                {ch}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
