import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../hooks/useGameStore';
import { storage } from '../../lib/storage';

const MAZE = [
  [0, 0, 1, 0, 0, 0, 0],
  [1, 0, 1, 0, 1, 1, 0],
  [0, 0, 0, 0, 0, 1, 0],
  [0, 1, 1, 1, 0, 1, 0],
  [0, 0, 0, 1, 0, 0, 0],
  [1, 1, 0, 1, 1, 0, 1],
  [0, 0, 0, 0, 1, 0, 0],
];

const KEY_POS = [
  { x: 1, y: 0 },
  { x: 3, y: 1 },
  { x: 4, y: 2 },
  { x: 0, y: 4 },
  { x: 2, y: 5 },
];

const EXIT = { x: 6, y: 6 };

const QUESTIONS = [
  { q: 'What do plants need to grow?', opts: ['Sunlight & water', 'Pizza & soda'], a: 0 },
  { q: 'How many states in the USA?', opts: ['50', '48'], a: 0 },
  { q: 'Largest planet in our solar system?', opts: ['Jupiter', 'Earth'], a: 0 },
  { q: 'Caterpillars turn into?', opts: ['Butterflies', 'Frogs'], a: 0 },
  { q: 'Capital of Louisiana?', opts: ['Baton Rouge', 'New Orleans'], a: 0 },
];

const TILE = 48;
const GRID = 7;
const CANVAS_SIZE = GRID * TILE;

type Dir = 'up' | 'down' | 'left' | 'right';
type Phase = 'playing' | 'question' | 'won';

export function SwampEscape() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });
  const [collectedKeys, setCollectedKeys] = useState<Set<number>>(new Set());
  const [phase, setPhase] = useState<Phase>('playing');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [wrongMsg, setWrongMsg] = useState(false);
  const [pendingKeyIdx, setPendingKeyIdx] = useState<number | null>(null);

  const playerRef = useRef({ x: 0, y: 0 });
  const collectedRef = useRef<Set<number>>(new Set());
  const phaseRef = useRef<Phase>('playing');
  const pulseRef = useRef(0);

  // Sync refs
  useEffect(() => {
    playerRef.current = playerPos;
  }, [playerPos]);
  useEffect(() => {
    collectedRef.current = collectedKeys;
  }, [collectedKeys]);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // Draw loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const draw = () => {
      pulseRef.current += 0.03;
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      // Draw tiles
      for (let y = 0; y < GRID; y++) {
        for (let x = 0; x < GRID; x++) {
          ctx.fillStyle = MAZE[y][x] === 1 ? '#1a2e1a' : '#2d4a2d';
          ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
          ctx.strokeStyle = 'rgba(0,0,0,0.3)';
          ctx.strokeRect(x * TILE, y * TILE, TILE, TILE);
        }
      }

      // Draw exit (pulsing teal)
      const ep = Math.sin(pulseRef.current * 2) * 0.3 + 0.7;
      ctx.fillStyle = `rgba(0,200,200,${ep})`;
      ctx.fillRect(EXIT.x * TILE + 4, EXIT.y * TILE + 4, TILE - 8, TILE - 8);
      ctx.strokeStyle = 'rgba(0,255,255,0.5)';
      ctx.lineWidth = 2;
      ctx.strokeRect(EXIT.x * TILE + 4, EXIT.y * TILE + 4, TILE - 8, TILE - 8);
      ctx.lineWidth = 1;

      // Draw keys
      KEY_POS.forEach((k, i) => {
        if (collectedRef.current.has(i)) return;
        const cx = k.x * TILE + TILE / 2;
        const cy = k.y * TILE + TILE / 2;
        // Gold circle
        ctx.beginPath();
        ctx.arc(cx, cy, 10, 0, Math.PI * 2);
        ctx.fillStyle = '#FFB800';
        ctx.fill();
        ctx.strokeStyle = '#CC8800';
        ctx.stroke();
        // Star
        ctx.fillStyle = '#FFF';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('★', cx, cy + 1);
      });

      // Draw player
      const px = playerRef.current.x * TILE + TILE / 2;
      const py = playerRef.current.y * TILE + TILE / 2;
      ctx.beginPath();
      ctx.arc(px, py, 14, 0, Math.PI * 2);
      ctx.fillStyle = '#00c896';
      ctx.fill();
      ctx.strokeStyle = '#00e6ac';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.lineWidth = 1;
      // Eyes
      ctx.fillStyle = '#FFF';
      ctx.beginPath();
      ctx.arc(px - 4, py - 3, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(px + 4, py - 3, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0d1f0d';
      ctx.beginPath();
      ctx.arc(px - 4, py - 3, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(px + 4, py - 3, 1.5, 0, Math.PI * 2);
      ctx.fill();

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  const tryMove = useCallback(
    (dir: Dir) => {
      if (phaseRef.current !== 'playing') return;
      const { x, y } = playerRef.current;
      let nx = x,
        ny = y;
      if (dir === 'up') ny = y - 1;
      if (dir === 'down') ny = y + 1;
      if (dir === 'left') nx = x - 1;
      if (dir === 'right') nx = x + 1;

      if (nx < 0 || nx >= GRID || ny < 0 || ny >= GRID) return;
      if (MAZE[ny][nx] === 1) return;

      setPlayerPos({ x: nx, y: ny });

      // Check key collision
      const keyIdx = KEY_POS.findIndex((k, i) => k.x === nx && k.y === ny && !collectedRef.current.has(i));
      if (keyIdx >= 0) {
        setPendingKeyIdx(keyIdx);
        setCurrentQuestion(keyIdx);
        setWrongMsg(false);
        setPhase('question');
        return;
      }

      // Check exit
      if (nx === EXIT.x && ny === EXIT.y && collectedRef.current.size >= 5) {
        setPhase('won');
      }
    },
    [],
  );

  // Keyboard controls
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const map: Record<string, Dir> = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
        w: 'up',
        s: 'down',
        a: 'left',
        d: 'right',
      };
      const dir = map[e.key];
      if (dir) {
        e.preventDefault();
        tryMove(dir);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [tryMove]);

  const handleQuestionAnswer = useCallback(
    (optIdx: number) => {
      if (pendingKeyIdx === null) return;
      if (optIdx === QUESTIONS[currentQuestion].a) {
        // Correct
        setCollectedKeys((prev) => {
          const next = new Set(prev);
          next.add(pendingKeyIdx);
          return next;
        });
        setPendingKeyIdx(null);
        setWrongMsg(false);
        setPhase('playing');
      } else {
        setWrongMsg(true);
      }
    },
    [pendingKeyIdx, currentQuestion],
  );

  // Award XP on win
  const doneRef = useRef(false);
  useEffect(() => {
    if (phase === 'won' && !doneRef.current) {
      doneRef.current = true;
      const xp = 50 + collectedKeys.size * 10;
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
  }, [phase, collectedKeys.size]);

  const xpEarned = 50 + collectedKeys.size * 10;

  if (phase === 'won') {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6 animate-slide-up"
        style={{ background: '#0d1f0d' }}
      >
        <div
          className="rounded-2xl p-8 max-w-sm w-full text-center"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '2px solid rgba(0,200,200,0.4)',
            boxShadow: '0 0 40px rgba(0,200,200,0.15)',
          }}
        >
          <div className="text-5xl mb-4">🏆</div>
          <h2 className="font-display text-3xl font-bold text-forest mb-2">Escaped the Swamp!</h2>
          <p className="text-bark-light text-lg mb-1">
            Keys collected: <span className="text-gold font-bold">{collectedKeys.size}</span> / 5
          </p>
          <p className="text-forest font-bold text-2xl mb-6">+{xpEarned} XP</p>
          <button
            onClick={() => navigate('/')}
            className="w-full rounded-xl py-4 font-display font-bold text-lg text-white transition-all active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #00c896 0%, #00a67a 100%)',
              boxShadow: '0 4px 0 #008060',
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
          Swamp Escape
        </h1>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={`text-lg ${collectedKeys.has(i) ? 'text-gold' : 'text-bark-light opacity-30'}`}
            >
              ★
            </span>
          ))}
        </div>
      </div>

      {/* Canvas area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="rounded-xl"
          style={{
            border: '2px solid rgba(0,200,150,0.3)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
            maxWidth: '100%',
            imageRendering: 'pixelated',
          }}
        />

        {/* Question overlay */}
        {phase === 'question' && (
          <div
            className="absolute inset-0 flex items-center justify-center p-4 z-10"
            style={{ background: 'rgba(0,0,0,0.75)' }}
          >
            <div
              className="rounded-2xl p-6 max-w-sm w-full animate-bounce-in"
              style={{
                background: '#1a2e1a',
                border: '2px solid rgba(255,184,0,0.5)',
                boxShadow: '0 0 30px rgba(255,184,0,0.15)',
              }}
            >
              <p className="font-display text-xl font-bold text-gold mb-1 text-center">★ Key Question ★</p>
              <p className="text-white text-lg text-center mb-5">{QUESTIONS[currentQuestion].q}</p>
              {wrongMsg && (
                <p className="text-red-400 text-center text-sm mb-3 animate-shake">Not quite! Try again!</p>
              )}
              <div className="space-y-3">
                {QUESTIONS[currentQuestion].opts.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuestionAnswer(i)}
                    className="w-full rounded-xl py-4 font-display font-bold text-lg text-white transition-all active:scale-95"
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: '2px solid rgba(255,255,255,0.2)',
                      boxShadow: '0 3px 0 rgba(0,0,0,0.3)',
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* D-pad */}
      <div className="p-4 flex justify-center">
        <div className="grid grid-cols-3 gap-1" style={{ width: '156px' }}>
          <div />
          <DPadBtn dir="up" label="Move up" onPress={() => tryMove('up')} />
          <div />
          <DPadBtn dir="left" label="Move left" onPress={() => tryMove('left')} />
          <div />
          <DPadBtn dir="right" label="Move right" onPress={() => tryMove('right')} />
          <div />
          <DPadBtn dir="down" label="Move down" onPress={() => tryMove('down')} />
          <div />
        </div>
      </div>

      {/* Hint text */}
      <p className="text-center text-bark-light text-xs pb-4 opacity-60">
        {collectedKeys.size < 5
          ? `Collect all 5 keys to unlock the exit`
          : `All keys collected! Head to the exit`}
      </p>
    </div>
  );
}

function DPadBtn({ dir, label, onPress }: { dir: Dir; label: string; onPress: () => void }) {
  const arrows: Record<Dir, string> = { up: '▲', down: '▼', left: '◀', right: '▶' };
  return (
    <button
      onClick={onPress}
      className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold active:scale-90 transition-transform"
      style={{
        background: 'rgba(255,255,255,0.1)',
        border: '1.5px solid rgba(255,255,255,0.15)',
      }}
      aria-label={label}
    >
      {arrows[dir]}
    </button>
  );
}
