import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../hooks/useGameStore';
import { storage } from '../../lib/storage';
import { SFX } from '../../lib/sfx';
import { questions as questionBank } from '../../data/questions';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateQuestions() {
  const eligible = questionBank.filter(
    (q) => q.tier === 'introductory' && q.questionType === 'multiple_choice' && q.options,
  );
  const selected = shuffle(eligible).slice(0, 5);
  return selected.map((q) => {
    const correct = typeof q.correctAnswer === 'string' ? q.correctAnswer : q.correctAnswer[0];
    const wrong = shuffle(q.options!.filter((o) => o !== correct))[0];
    const opts = shuffle([correct, wrong]);
    return { q: q.question, opts, a: opts.indexOf(correct) };
  });
}

function generateMaze(size: number): number[][] {
  // Start with all walls
  const maze: number[][] = Array.from({ length: size }, () => Array(size).fill(1) as number[]);

  // Recursive backtracker
  function carve(x: number, y: number) {
    maze[y][x] = 0;
    const dirs = shuffle([
      [0, -1],
      [0, 1],
      [-1, 0],
      [1, 0],
    ]);
    for (const [dx, dy] of dirs) {
      const nx = x + dx * 2;
      const ny = y + dy * 2;
      if (nx >= 0 && nx < size && ny >= 0 && ny < size && maze[ny][nx] === 1) {
        maze[y + dy][x + dx] = 0; // Carve wall between
        carve(nx, ny);
      }
    }
  }

  carve(0, 0);
  // Ensure exit is accessible
  maze[size - 1][size - 1] = 0;
  maze[size - 2][size - 1] = 0;
  maze[size - 1][size - 2] = 0;

  return maze;
}

function placeKeys(maze: number[][], count: number): { x: number; y: number }[] {
  const size = maze.length;
  const floors: { x: number; y: number }[] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < maze[0].length; x++) {
      if (maze[y][x] === 0 && !(x === 0 && y === 0) && !(x === size - 1 && y === size - 1)) {
        floors.push({ x, y });
      }
    }
  }
  return shuffle(floors).slice(0, count);
}

const TILE = 48;
const GRID = 7;
const CANVAS_SIZE = GRID * TILE;
const EXIT = { x: 6, y: 6 };

type Dir = 'up' | 'down' | 'left' | 'right';
type Phase = 'playing' | 'question' | 'won' | 'expired';

export function SwampEscape() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate maze, keys, and questions once per game
  const gameData = useMemo(() => {
    const maze = generateMaze(GRID);
    const keys = placeKeys(maze, 5);
    const questions = generateQuestions();
    return { maze, keys, questions };
  }, []);

  const { maze, keys: KEY_POS, questions: QUESTIONS } = gameData;

  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });
  const [collectedKeys, setCollectedKeys] = useState<Set<number>>(new Set());
  const [phase, setPhase] = useState<Phase>('playing');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [wrongMsg, setWrongMsg] = useState(false);
  const [pendingKeyIdx, setPendingKeyIdx] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(180);

  const playerRef = useRef({ x: 0, y: 0 });
  const collectedRef = useRef<Set<number>>(new Set());
  const phaseRef = useRef<Phase>('playing');
  const pulseRef = useRef(0);
  const mazeRef = useRef(maze);
  const keysRef = useRef(KEY_POS);

  // Keep refs fresh
  mazeRef.current = maze;
  keysRef.current = KEY_POS;

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

  // Countdown timer
  useEffect(() => {
    if (phase !== 'playing' && phase !== 'question') return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setPhase('expired');
          SFX.gameOver();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
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
      const currentMaze = mazeRef.current;
      const currentKeys = keysRef.current;

      // Draw tiles
      for (let y = 0; y < GRID; y++) {
        for (let x = 0; x < GRID; x++) {
          ctx.fillStyle = currentMaze[y][x] === 1 ? '#1a2e1a' : '#2d4a2d';
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
      currentKeys.forEach((k, i) => {
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
        ctx.fillText('\u2605', cx, cy + 1);
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
      if (maze[ny][nx] === 1) return;

      SFX.tap();
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
    [maze, KEY_POS],
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
        SFX.correct();
        setCollectedKeys((prev) => {
          const next = new Set(prev);
          next.add(pendingKeyIdx);
          return next;
        });
        setPendingKeyIdx(null);
        setWrongMsg(false);
        setPhase('playing');
      } else {
        SFX.wrong();
        setWrongMsg(true);
      }
    },
    [pendingKeyIdx, currentQuestion, QUESTIONS],
  );

  // Award XP on win
  const doneRef = useRef(false);
  useEffect(() => {
    if (phase === 'won' && !doneRef.current) {
      doneRef.current = true;
      SFX.fanfare();
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

  // Award partial XP on expired
  const expiredRef = useRef(false);
  useEffect(() => {
    if (phase === 'expired' && !expiredRef.current) {
      expiredRef.current = true;
      const xp = 10 + collectedKeys.size * 10;
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

  const xpEarned = phase === 'expired' ? 10 + collectedKeys.size * 10 : 50 + collectedKeys.size * 10;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timerStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

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

  if (phase === 'expired') {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6 animate-slide-up"
        style={{ background: '#0d1f0d' }}
      >
        <div
          className="rounded-2xl p-8 max-w-sm w-full text-center"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '2px solid rgba(239,68,68,0.4)',
            boxShadow: '0 0 40px rgba(239,68,68,0.15)',
          }}
        >
          <div className="text-5xl mb-4">⏰</div>
          <h2 className="font-display text-3xl font-bold text-red-400 mb-2">Time's Up!</h2>
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
        <div className="flex items-center gap-3">
          <div
            className={`font-display font-bold text-lg px-3 py-1 rounded-lg ${timeLeft < 30 ? 'text-red-400 animate-pulse' : 'text-white'}`}
            style={{
              background: timeLeft < 30 ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.08)',
              border: timeLeft < 30 ? '1.5px solid rgba(239,68,68,0.4)' : '1.5px solid rgba(255,255,255,0.15)',
            }}
          >
            ⏱ {timerStr}
          </div>
        </div>
      </div>

      {/* Keys display */}
      <div className="flex justify-center gap-1 pb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={`text-lg ${collectedKeys.has(i) ? 'text-gold' : 'text-bark-light opacity-30'}`}
          >
            ★
          </span>
        ))}
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
