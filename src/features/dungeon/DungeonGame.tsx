import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../hooks/useGameStore';
import { cryptidRoster } from '../themes/cryptids/cryptidTheme';

/* ── Per-cryptid grid config ── */
const CRYPTID_CONFIG: Record<string, { cols: number; rows: number; clues: number; minutes: number }> = {
  'honey-island-swamp-monster': { cols: 15, rows: 15, clues: 5, minutes: 3 },
  'rougarou':                   { cols: 18, rows: 16, clues: 6, minutes: 4 },
  'bigfoot':                    { cols: 20, rows: 18, clues: 7, minutes: 4 },
  'mothman':                    { cols: 22, rows: 20, clues: 7, minutes: 5 },
  'chupacabra':                 { cols: 24, rows: 20, clues: 8, minutes: 5 },
  'jersey-devil':               { cols: 25, rows: 22, clues: 8, minutes: 5 },
  'thunderbird':                { cols: 26, rows: 22, clues: 9, minutes: 6 },
  'loch-ness-monster':          { cols: 28, rows: 24, clues: 10, minutes: 6 },
};
const DEFAULT_CONFIG = { cols: 15, rows: 15, clues: 5, minutes: 3 };

/* ── Capture XP by cryptid (scales with difficulty) ── */
const CAPTURE_XP: Record<string, number> = {
  'honey-island-swamp-monster': 50,
  'rougarou':                   75,
  'bigfoot':                    100,
  'mothman':                    100,
  'chupacabra':                 125,
  'jersey-devil':               125,
  'thunderbird':                150,
  'loch-ness-monster':          175,
};
const DEFAULT_CAPTURE_XP = 50;

type Dir = 'up' | 'down' | 'left' | 'right';
interface Pos { x: number; y: number }

/* Simple seeded random from cryptid id */
function seededRandom(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  return () => { h = (h * 16807) % 2147483647; return (h & 0x7fffffff) / 0x7fffffff; };
}

/* ── Dungeon map generation ── */
const WALL = 1;
const FLOOR = 0;

function generateMap(cryptidId: string, cols: number, rows: number, totalClues: number): { map: number[][]; cluePositions: Pos[]; startPos: Pos } {
  const rand = seededRandom(cryptidId);
  const map: number[][] = Array.from({ length: rows }, () => Array(cols).fill(FLOOR));

  // Borders are walls
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    if (x === 0 || x === cols - 1 || y === 0 || y === rows - 1) map[y][x] = WALL;
  }

  // Scatter interior walls (scale with grid size)
  const wallCount = Math.floor((cols * rows) * 0.08) + Math.floor(rand() * Math.floor((cols * rows) * 0.04));
  for (let i = 0; i < wallCount; i++) {
    const wx = 1 + Math.floor(rand() * (cols - 2));
    const wy = 1 + Math.floor(rand() * (rows - 2));
    if (wx === 1 && wy === 1) continue;
    map[wy][wx] = WALL;
  }

  // Player start
  const startPos = { x: 1, y: 1 };
  map[startPos.y][startPos.x] = FLOOR;

  // Place clues on floor tiles
  const floorTiles: Pos[] = [];
  for (let y = 1; y < rows - 1; y++) for (let x = 1; x < cols - 1; x++) {
    if (map[y][x] === FLOOR && !(x === 1 && y === 1)) floorTiles.push({ x, y });
  }
  for (let i = floorTiles.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [floorTiles[i], floorTiles[j]] = [floorTiles[j], floorTiles[i]];
  }
  const cluePositions = floorTiles.slice(0, totalClues);

  return { map, cluePositions, startPos };
}

const CLUE_ICONS = [
  '/assets/dungeon/clue-footprint.png',
  '/assets/dungeon/clue-feather.png',
  '/assets/dungeon/clue-slime.png',
  '/assets/dungeon/clue-journal.png',
  '/assets/dungeon/clue-eye.png',
];

export function DungeonGame() {
  const navigate = useNavigate();
  const { progress } = useGameStore();
  const pendingId = progress.pendingCapture;
  const cryptid = pendingId ? cryptidRoster.find((c) => c.id === pendingId) : null;

  /* ── Derive grid constants from config ── */
  const cfg = CRYPTID_CONFIG[pendingId ?? ''] ?? DEFAULT_CONFIG;
  const COLS = cfg.cols;
  const ROWS = cfg.rows;
  const TOTAL_CLUES = cfg.clues;
  const availableW = Math.min(520, (typeof window !== 'undefined' ? window.innerWidth : 400) - 32);
  const TILE = Math.floor(availableW / COLS);
  const canvasW = COLS * TILE;
  const canvasH = ROWS * TILE;
  const FLASHLIGHT_RADIUS = Math.max(3, Math.floor(COLS / 5));

  const [playerPos, setPlayerPos] = useState<Pos>({ x: 1, y: 1 });
  const [facing, setFacing] = useState<Dir>('down');
  const [collectedClues, setCollectedClues] = useState<Set<number>>(new Set());
  const [won, setWon] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [timeLeft, setTimeLeft] = useState(cfg.minutes * 60);
  const [timeExpired, setTimeExpired] = useState(false);

  const dungeonData = useRef(generateMap(pendingId ?? 'default', COLS, ROWS, TOTAL_CLUES));
  const { map, cluePositions } = dungeonData.current;
  const capturedCryptid = useRef(cryptid);

  /* ── Canvas refs ── */
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<Record<string, HTMLImageElement>>({});
  const imagesLoadedRef = useRef(false);

  // Preload images
  useEffect(() => {
    const srcs = [
      '/assets/dungeon/tile-wall.png',
      '/assets/dungeon/tile-floor.png',
      '/assets/dungeon/player.png',
      ...CLUE_ICONS,
    ];
    let loaded = 0;
    srcs.forEach((src) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        loaded++;
        if (loaded === srcs.length) imagesLoadedRef.current = true;
      };
      imagesRef.current[src] = img;
    });
  }, []);

  // Redirect if no pending capture (but not while showing victory/expired)
  useEffect(() => {
    if (!pendingId && !won && !timeExpired) navigate('/dungeon');
  }, [pendingId, won, timeExpired, navigate]);

  /* ── Countdown timer ── */
  useEffect(() => {
    if (won || timeExpired) return;
    const iv = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setTimeExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [won, timeExpired]);

  const tryMove = useCallback((dir: Dir) => {
    if (won || timeExpired) return;
    setFacing(dir);
    setPlayerPos((prev) => {
      const delta: Record<Dir, Pos> = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
      const nx = prev.x + delta[dir].x;
      const ny = prev.y + delta[dir].y;
      if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS || map[ny][nx] === WALL) return prev;
      return { x: nx, y: ny };
    });
  }, [map, won, timeExpired, COLS, ROWS]);

  // Check clue collection after move
  useEffect(() => {
    if (won || timeExpired) return;
    cluePositions.forEach((cp, idx) => {
      if (cp.x === playerPos.x && cp.y === playerPos.y && !collectedClues.has(idx)) {
        setCollectedClues((prev) => {
          const next = new Set(prev);
          next.add(idx);
          if (next.size >= TOTAL_CLUES) {
            setWon(true);
          }
          return next;
        });
      }
    });
  }, [playerPos, cluePositions, collectedClues, won, timeExpired, TOTAL_CLUES]);

  // Victory: complete capture + award XP after brief delay
  useEffect(() => {
    if (!won || !pendingId) return;
    const t = setTimeout(() => {
      const xpAward = CAPTURE_XP[pendingId] ?? DEFAULT_CAPTURE_XP;
      useGameStore.getState().completePendingCapture(pendingId, xpAward);
      setShowVictory(true);
    }, 600);
    return () => clearTimeout(t);
  }, [won, pendingId]);

  // Keyboard controls
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const keyMap: Record<string, Dir> = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right' };
      const dir = keyMap[e.key];
      if (dir) { e.preventDefault(); tryMove(dir); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [tryMove]);

  // Touch controls
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  /* ── Canvas draw loop ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId: number;

    const draw = () => {
      if (!imagesLoadedRef.current) {
        rafId = requestAnimationFrame(draw);
        return;
      }

      const imgs = imagesRef.current;
      const floorImg = imgs['/assets/dungeon/tile-floor.png'];
      const wallImg = imgs['/assets/dungeon/tile-wall.png'];
      const playerImg = imgs['/assets/dungeon/player.png'];

      ctx.clearRect(0, 0, canvasW, canvasH);

      // 1. Draw floor everywhere
      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          ctx.drawImage(floorImg, x * TILE, y * TILE, TILE, TILE);
        }
      }

      // 2. Draw walls
      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          if (map[y][x] === WALL) {
            ctx.drawImage(wallImg, x * TILE, y * TILE, TILE, TILE);
          }
        }
      }

      // 3. Draw clues (visible within flashlight range)
      const dist = (a: Pos, b: Pos) => Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
      cluePositions.forEach((cp, idx) => {
        if (collectedClues.has(idx)) return;
        const d = dist(playerPos, cp);
        const outerLimit = FLASHLIGHT_RADIUS * 1.5;
        if (d > outerLimit) return;
        const alpha = d <= FLASHLIGHT_RADIUS ? 1.0 : 1.0 - ((d - FLASHLIGHT_RADIUS) / (outerLimit - FLASHLIGHT_RADIUS));
        ctx.save();
        ctx.globalAlpha = alpha;
        const clueImg = imgs[CLUE_ICONS[idx % CLUE_ICONS.length]];
        const pad = TILE * 0.15;
        ctx.drawImage(clueImg, cp.x * TILE + pad, cp.y * TILE + pad, TILE - pad * 2, TILE - pad * 2);
        ctx.restore();
      });

      // 4. Draw player
      ctx.save();
      const px = playerPos.x * TILE;
      const py = playerPos.y * TILE;
      if (facing === 'left') {
        ctx.translate(px + TILE, py);
        ctx.scale(-1, 1);
        ctx.drawImage(playerImg, 0, 0, TILE, TILE);
      } else {
        ctx.drawImage(playerImg, px, py, TILE, TILE);
      }
      ctx.restore();

      // 5. Darkness overlay with flashlight hole
      ctx.save();
      // Draw full dark layer
      ctx.fillStyle = 'rgba(0,0,0,0.88)';
      ctx.fillRect(0, 0, canvasW, canvasH);
      // Punch flashlight circle
      ctx.globalCompositeOperation = 'destination-out';
      const cx = playerPos.x * TILE + TILE / 2;
      const cy = playerPos.y * TILE + TILE / 2;
      const r = FLASHLIGHT_RADIUS * TILE;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0, 'rgba(0,0,0,1)');
      grad.addColorStop(0.6, 'rgba(0,0,0,1)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [playerPos, facing, collectedClues, map, cluePositions, canvasW, canvasH, TILE, COLS, ROWS, FLASHLIGHT_RADIUS]);

  // Update ref while we still have cryptid
  if (cryptid) capturedCryptid.current = cryptid;
  if (!capturedCryptid.current && !pendingId) return null;

  /* ── Format timer ── */
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timerStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  const timerUrgent = timeLeft <= 60 && !won;

  /* ── Time expired screen ── */
  if (timeExpired && !won) {
    return (
      <div className="p-4 max-w-lg mx-auto space-y-6 animate-slide-up text-center">
        <div
          className="rounded-2xl p-8"
          style={{
            background: 'linear-gradient(180deg, rgba(220,40,40,0.15) 0%, rgba(180,20,20,0.08) 100%)',
            border: '2px solid rgba(220,40,40,0.4)',
            boxShadow: '0 0 40px rgba(220,40,40,0.15)',
          }}
        >
          <div className="text-6xl mb-4">⏰</div>
          <h1 className="font-display text-3xl font-bold text-red-400 mb-2">TIME'S UP!</h1>
          <p className="text-white text-lg mb-1">The {capturedCryptid.current?.name} slipped away...</p>
          <p className="text-bark-light text-sm mt-2">
            You found {collectedClues.size} of {TOTAL_CLUES} clues before time ran out.
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => {
              // Reset and retry
              setPlayerPos({ x: 1, y: 1 });
              setFacing('down');
              setCollectedClues(new Set());
              setWon(false);
              setShowVictory(false);
              setTimeLeft(cfg.minutes * 60);
              setTimeExpired(false);
              dungeonData.current = generateMap(pendingId ?? 'default', COLS, ROWS, TOTAL_CLUES);
            }}
            className="rounded-2xl px-6 py-3 font-display font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              boxShadow: '0 4px 0 #b45309, 0 0 20px rgba(245,158,11,0.2)',
              border: '2px solid rgba(255,255,255,0.15)',
            }}
          >
            Try Again
          </button>
          <button
            onClick={() => navigate('/dungeon')}
            className="rounded-2xl px-6 py-3 font-display font-bold text-bark-light transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '2px solid rgba(255,255,255,0.15)',
            }}
          >
            Exit
          </button>
        </div>
      </div>
    );
  }

  // Victory overlay
  if (showVictory) {
    const xpAward = CAPTURE_XP[pendingId ?? ''] ?? DEFAULT_CAPTURE_XP;
    return (
      <div className="p-4 max-w-lg mx-auto space-y-6 animate-slide-up text-center">
        <div
          className="rounded-2xl p-8 animate-glow-pulse"
          style={{
            background: 'linear-gradient(180deg, rgba(255,184,0,0.2) 0%, rgba(255,140,0,0.1) 100%)',
            border: '2px solid rgba(255,184,0,0.5)',
            boxShadow: '0 0 60px rgba(255,184,0,0.2)',
          }}
        >
          <div className="text-6xl mb-4 animate-bounce-in">🏆</div>
          <h1 className="font-display text-3xl font-bold text-gold mb-2">CAPTURED!</h1>
          <p className="text-white text-lg mb-1">{capturedCryptid.current?.name}</p>
          <p className="text-bark-light text-sm">{capturedCryptid.current?.region}</p>
          <p className="text-gold-light text-lg font-bold mt-4 animate-bounce-in">+{xpAward} XP</p>
          <p className="text-gold-light text-sm mt-1">
            The {capturedCryptid.current?.name} has been added to your Field Guide!
          </p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="rounded-2xl px-8 py-4 font-display font-bold text-lg text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, #00c896 0%, #00a67a 100%)',
            boxShadow: '0 4px 0 #008060, 0 0 20px rgba(0,200,150,0.2)',
            border: '2px solid rgba(255,255,255,0.15)',
          }}
        >
          View Dossier
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4 animate-slide-up">
      {/* Header with timer */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/dungeon')} className="text-bark-light hover:text-white transition-colors text-sm">
          &larr; Exit
        </button>
        <div
          className={`font-display font-bold text-lg ${timerUrgent ? 'text-red-400' : 'text-gold'}`}
          style={timerUrgent ? { animation: 'pulse 1s ease-in-out infinite' } : undefined}
        >
          {timerStr}
        </div>
        <div className="text-sm text-bark-light">{collectedClues.size}/{TOTAL_CLUES}</div>
      </div>

      {/* Clue tracker */}
      <div className="flex gap-2 justify-center flex-wrap">
        {Array.from({ length: TOTAL_CLUES }).map((_, i) => (
          <div
            key={i}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${collectedClues.has(i) ? 'animate-bounce-in' : ''}`}
            style={collectedClues.has(i)
              ? { background: 'rgba(255,184,0,0.2)', border: '2px solid rgba(255,184,0,0.5)', boxShadow: '0 0 12px rgba(255,184,0,0.3)' }
              : { background: 'rgba(255,255,255,0.06)', border: '2px solid rgba(255,255,255,0.1)' }
            }
          >
            {collectedClues.has(i) ? (
              <img src={CLUE_ICONS[i % CLUE_ICONS.length]} alt="" className="w-5 h-5" />
            ) : (
              <span className="text-bark-light text-xs">?</span>
            )}
          </div>
        ))}
      </div>

      {/* Canvas game board */}
      <div
        className="relative mx-auto rounded-xl overflow-hidden"
        style={{
          width: canvasW,
          height: canvasH,
          background: '#0a1a12',
          border: '2px solid rgba(0,200,150,0.2)',
          boxShadow: '0 0 30px rgba(0,0,0,0.5)',
          touchAction: 'none',
        }}
        onTouchStart={(e) => { touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }}
        onTouchEnd={(e) => {
          if (!touchStart.current) return;
          const dx = e.changedTouches[0].clientX - touchStart.current.x;
          const dy = e.changedTouches[0].clientY - touchStart.current.y;
          touchStart.current = null;
          if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
          if (Math.abs(dx) > Math.abs(dy)) tryMove(dx > 0 ? 'right' : 'left');
          else tryMove(dy > 0 ? 'down' : 'up');
        }}
      >
        <canvas ref={canvasRef} width={canvasW} height={canvasH} />
      </div>

      {/* D-pad controls for mobile */}
      <div className="flex justify-center">
        <div className="grid grid-cols-3 gap-1" style={{ width: 160 }}>
          <div />
          <DPadBtn dir="up" label="Up" onPress={() => tryMove('up')} />
          <div />
          <DPadBtn dir="left" label="Left" onPress={() => tryMove('left')} />
          <div className="w-12 h-12" />
          <DPadBtn dir="right" label="Right" onPress={() => tryMove('right')} />
          <div />
          <DPadBtn dir="down" label="Down" onPress={() => tryMove('down')} />
          <div />
        </div>
      </div>
    </div>
  );
}

function DPadBtn({ dir, label, onPress }: { dir: Dir; label: string; onPress: () => void }) {
  const arrows: Record<Dir, string> = { up: '\u25B2', down: '\u25BC', left: '\u25C0', right: '\u25B6' };
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
