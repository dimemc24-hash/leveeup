import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../hooks/useGameStore';
import { cryptidRoster } from '../themes/cryptids/cryptidTheme';

/* ── Constants ── */
const TILE = 48;
const COLS = 7;
const ROWS = 9;
const TOTAL_CLUES = 5;
const FLASHLIGHT_RADIUS = 2.5; // tiles

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

function generateMap(cryptidId: string): { map: number[][]; cluePositions: Pos[]; startPos: Pos } {
  const rand = seededRandom(cryptidId);
  // Fill with floor
  const map: number[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(FLOOR));

  // Borders are walls
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
    if (x === 0 || x === COLS - 1 || y === 0 || y === ROWS - 1) map[y][x] = WALL;
  }

  // Scatter some interior walls (not too many)
  const wallCount = 6 + Math.floor(rand() * 4);
  for (let i = 0; i < wallCount; i++) {
    const wx = 1 + Math.floor(rand() * (COLS - 2));
    const wy = 1 + Math.floor(rand() * (ROWS - 2));
    if (wx === 1 && wy === 1) continue; // keep start clear
    map[wy][wx] = WALL;
  }

  // Player start
  const startPos = { x: 1, y: 1 };
  map[startPos.y][startPos.x] = FLOOR;

  // Place clues on floor tiles
  const floorTiles: Pos[] = [];
  for (let y = 1; y < ROWS - 1; y++) for (let x = 1; x < COLS - 1; x++) {
    if (map[y][x] === FLOOR && !(x === 1 && y === 1)) floorTiles.push({ x, y });
  }
  // Shuffle
  for (let i = floorTiles.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [floorTiles[i], floorTiles[j]] = [floorTiles[j], floorTiles[i]];
  }
  const cluePositions = floorTiles.slice(0, TOTAL_CLUES);

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

  const [playerPos, setPlayerPos] = useState<Pos>({ x: 1, y: 1 });
  const [facing, setFacing] = useState<Dir>('down');
  const [collectedClues, setCollectedClues] = useState<Set<number>>(new Set());
  const [won, setWon] = useState(false);
  const [showVictory, setShowVictory] = useState(false);

  const dungeonData = useRef(generateMap(pendingId ?? 'default'));
  const { map, cluePositions } = dungeonData.current;

  // Redirect if no pending capture
  useEffect(() => {
    if (!pendingId) navigate('/dungeon');
  }, [pendingId, navigate]);

  const tryMove = useCallback((dir: Dir) => {
    if (won) return;
    setFacing(dir);
    setPlayerPos((prev) => {
      const delta: Record<Dir, Pos> = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
      const nx = prev.x + delta[dir].x;
      const ny = prev.y + delta[dir].y;
      if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS || map[ny][nx] === WALL) return prev;
      return { x: nx, y: ny };
    });
  }, [map, won]);

  // Check clue collection after move
  useEffect(() => {
    if (won) return;
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
  }, [playerPos, cluePositions, collectedClues, won]);

  // Victory: complete capture after brief delay
  useEffect(() => {
    if (!won || !pendingId) return;
    const t = setTimeout(() => {
      useGameStore.getState().completePendingCapture(pendingId);
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

  if (!cryptid || !pendingId) return null;

  const dist = (a: Pos, b: Pos) => Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

  // Victory overlay
  if (showVictory) {
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
          <p className="text-white text-lg mb-1">{cryptid.name}</p>
          <p className="text-bark-light text-sm">{cryptid.region}</p>
          <p className="text-gold-light text-sm mt-4">
            The {cryptid.name} has been added to your Field Guide!
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

  const canvasW = COLS * TILE;
  const canvasH = ROWS * TILE;

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/dungeon')} className="text-bark-light hover:text-white transition-colors text-sm">
          &larr; Exit
        </button>
        <h2 className="font-display font-bold text-gold text-sm">Capture: {cryptid.name}</h2>
        <div className="text-sm text-bark-light">{collectedClues.size}/{TOTAL_CLUES}</div>
      </div>

      {/* Clue tracker */}
      <div className="flex gap-2 justify-center">
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
              <img src={CLUE_ICONS[i]} alt="" className="w-5 h-5" />
            ) : (
              <span className="text-bark-light text-xs">?</span>
            )}
          </div>
        ))}
      </div>

      {/* Game board */}
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
        {/* Tiles */}
        {map.map((row, y) => row.map((cell, x) => (
          <div
            key={`${x}-${y}`}
            className="absolute"
            style={{
              left: x * TILE,
              top: y * TILE,
              width: TILE,
              height: TILE,
              backgroundImage: `url(${cell === WALL ? '/assets/dungeon/tile-wall.png' : '/assets/dungeon/tile-floor.png'})`,
              backgroundSize: 'cover',
            }}
          />
        )))}

        {/* Clues */}
        {cluePositions.map((cp, idx) => !collectedClues.has(idx) && (
          <div
            key={`clue-${idx}`}
            className="absolute flex items-center justify-center"
            style={{
              left: cp.x * TILE + 4,
              top: cp.y * TILE + 4,
              width: TILE - 8,
              height: TILE - 8,
              opacity: dist(playerPos, cp) <= FLASHLIGHT_RADIUS ? 1 : 0,
              transition: 'opacity 0.3s',
            }}
          >
            <img src={CLUE_ICONS[idx]} alt="Clue" className="w-8 h-8 animate-float" />
          </div>
        ))}

        {/* Player */}
        <div
          className="absolute transition-all duration-150 flex items-center justify-center"
          style={{
            left: playerPos.x * TILE,
            top: playerPos.y * TILE,
            width: TILE,
            height: TILE,
            zIndex: 10,
          }}
        >
          <img
            src="/assets/dungeon/player.png"
            alt="Player"
            className="w-10 h-10"
            style={{
              transform: facing === 'left' ? 'scaleX(-1)' : undefined,
              filter: 'drop-shadow(0 0 8px rgba(255,220,100,0.6))',
            }}
          />
        </div>

        {/* Flashlight glow — radial gradient overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle ${FLASHLIGHT_RADIUS * TILE}px at ${playerPos.x * TILE + TILE / 2}px ${playerPos.y * TILE + TILE / 2}px, transparent 0%, transparent 60%, rgba(0,0,0,0.85) 100%)`,
            zIndex: 20,
            transition: 'background 0.2s',
          }}
        />
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
