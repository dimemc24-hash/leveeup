import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../hooks/useGameStore';
import { storage } from '../../lib/storage';
import { SFX } from '../../lib/sfx';
import { matchPairs } from '../../data/matchCards';
import type { MatchPair } from '../../data/matchCards';

interface Card {
  index: number;
  pairId: string;
  text: string;
  side: 'front' | 'back';
  subject: MatchPair['subject'];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Pick 8 random pairs ensuring unique `back` values. */
function pickPairs(): MatchPair[] {
  const shuffled = shuffle(matchPairs);
  const seen = new Set<string>();
  const picked: MatchPair[] = [];
  for (const p of shuffled) {
    if (picked.length >= 8) break;
    if (!seen.has(p.back)) {
      seen.add(p.back);
      picked.push(p);
    }
  }
  return picked;
}

function buildCards(pairs: MatchPair[]): Card[] {
  const cards: Card[] = [];
  pairs.forEach((p) => {
    cards.push({ index: 0, pairId: p.id, text: p.front, side: 'front', subject: p.subject });
    cards.push({ index: 0, pairId: p.id, text: p.back, side: 'back', subject: p.subject });
  });
  const shuffled = shuffle(cards);
  return shuffled.map((c, i) => ({ ...c, index: i }));
}

function subjectBorderColor(subject: MatchPair['subject']): string {
  if (subject === 'math') return 'rgba(255,184,0,0.7)';
  if (subject === 'ela') return 'rgba(129,140,248,0.7)';
  return 'rgba(0,200,150,0.7)';
}

function subjectBg(subject: MatchPair['subject']): string {
  if (subject === 'math') return 'rgba(255,184,0,0.12)';
  if (subject === 'ela') return 'rgba(129,140,248,0.12)';
  return 'rgba(0,200,150,0.12)';
}

type Phase = 'playing' | 'done';

export function CryptidMatch() {
  const navigate = useNavigate();
  const [cards, setCards] = useState<Card[]>(() => buildCards(pickPairs()));
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedPairIds, setMatchedPairIds] = useState<Set<string>>(new Set());
  const [moves, setMoves] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [phase, setPhase] = useState<Phase>('playing');
  const lockRef = useRef(false);
  const flipTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Timer: count UP
  useEffect(() => {
    if (phase !== 'playing') return;
    const id = setInterval(() => setTimeElapsed((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  // Check for win
  useEffect(() => {
    if (matchedPairIds.size === 8 && phase === 'playing') {
      setPhase('done');
      SFX.fanfare();
    }
  }, [matchedPairIds, phase]);

  const handleCardTap = useCallback(
    (idx: number) => {
      if (phase !== 'playing') return;
      if (lockRef.current) return;
      // Ignore already flipped or matched
      if (flippedIndices.includes(idx)) return;
      if (matchedPairIds.has(cards[idx].pairId)) return;

      const newFlipped = [...flippedIndices, idx];
      setFlippedIndices(newFlipped);
      SFX.tap();

      if (newFlipped.length === 2) {
        lockRef.current = true;
        setMoves((m) => m + 1);
        const [a, b] = newFlipped;
        if (cards[a].pairId === cards[b].pairId) {
          // Match!
          setTimeout(() => {
            SFX.correct();
            setMatchedPairIds((prev) => new Set(prev).add(cards[a].pairId));
            setFlippedIndices([]);
            lockRef.current = false;
          }, 400);
        } else {
          // No match
          setTimeout(() => {
            SFX.wrong();
          }, 300);
          flipTimeout.current = setTimeout(() => {
            setFlippedIndices([]);
            lockRef.current = false;
          }, 800);
        }
      }
    },
    [phase, flippedIndices, matchedPairIds, cards],
  );

  useEffect(() => {
    return () => {
      if (flipTimeout.current) clearTimeout(flipTimeout.current);
    };
  }, []);

  // XP calculation
  const xp = 20 + Math.max(0, (8 - Math.min(Math.floor((moves - 16) / 2), 8))) * 10;

  // Award XP on done
  const doneRef = useRef(false);
  const awardXp = useCallback(() => {
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
  }, [xp]);

  useEffect(() => {
    if (phase === 'done' && !doneRef.current) {
      doneRef.current = true;
      awardXp();
    }
  }, [phase, awardXp]);

  const minutes = Math.floor(timeElapsed / 60);
  const seconds = timeElapsed % 60;
  const timerStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  // Reset game
  const resetGame = () => {
    doneRef.current = false;
    setCards(buildCards(pickPairs()));
    setFlippedIndices([]);
    setMatchedPairIds(new Set());
    setMoves(0);
    setTimeElapsed(0);
    setPhase('playing');
    lockRef.current = false;
  };

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
          <div className="text-5xl mb-4">{'\uD83C\uDCCF'}</div>
          <h2 className="font-display text-3xl font-bold text-gold mb-2">All Cryptids Matched!</h2>
          <p className="text-bark-light text-lg mb-1">
            Moves: <span className="text-white font-bold">{moves}</span>
          </p>
          <p className="text-bark-light text-lg mb-1">
            Time: <span className="text-white font-bold">{timerStr}</span>
          </p>
          <p className="text-forest font-bold text-2xl mb-6">+{xp} XP</p>
          <button
            onClick={resetGame}
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
          {'\u25C0'}
        </button>
        <h1 className="font-display text-xl font-bold text-white" style={{ textShadow: '0 0 20px rgba(0,200,150,0.3)' }}>
          Cryptid Match
        </h1>
        <div className="flex items-center gap-3">
          <span className="font-display font-bold text-white text-sm">{'\u23F1'} {timerStr}</span>
          <span className="font-display font-bold text-forest text-sm">{moves} moves</span>
        </div>
      </div>

      {/* 4x4 Card Grid */}
      <div className="flex-1 flex items-center justify-center px-3 py-2">
        <div className="grid grid-cols-4 gap-2 w-full max-w-[340px]">
          {cards.map((card) => {
            const isFlipped = flippedIndices.includes(card.index);
            const isMatched = matchedPairIds.has(card.pairId);
            const faceUp = isFlipped || isMatched;

            return (
              <button
                key={card.index}
                onClick={() => handleCardTap(card.index)}
                className={`relative w-full rounded-xl font-bold transition-transform duration-300 ${
                  isMatched ? 'animate-glow-pulse' : ''
                }`}
                style={{
                  aspectRatio: '4/5',
                  perspective: '600px',
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                }}
                aria-label={faceUp ? card.text : 'Hidden card'}
                disabled={isMatched}
              >
                <div
                  className="absolute inset-0 rounded-xl transition-transform duration-300"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: faceUp ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  }}
                >
                  {/* Face-down (front of the 3D card) */}
                  <div
                    className="absolute inset-0 rounded-xl flex items-center justify-center backface-hidden"
                    style={{
                      background: '#1a2e1a',
                      border: '2px solid rgba(255,255,255,0.15)',
                      backfaceVisibility: 'hidden',
                    }}
                  >
                    <span className="text-white text-2xl font-bold">?</span>
                  </div>
                  {/* Face-up (back of the 3D card) */}
                  <div
                    className="absolute inset-0 rounded-xl flex items-center justify-center p-1.5 backface-hidden"
                    style={{
                      background: subjectBg(card.subject),
                      border: `2px solid ${subjectBorderColor(card.subject)}`,
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                    }}
                  >
                    <span
                      className="text-white font-bold leading-tight text-center"
                      style={{ fontSize: card.text.length > 12 ? '0.6rem' : card.text.length > 6 ? '0.7rem' : '0.9rem' }}
                    >
                      {card.text}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
