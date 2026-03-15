import { Link } from 'react-router-dom';
import { useGameStore } from '../../hooks/useGameStore';
import { cryptidRoster } from '../themes/cryptids/cryptidTheme';

export function DungeonMenu() {
  const { progress } = useGameStore();
  const pendingId = progress.pendingCapture;
  const cryptid = pendingId ? cryptidRoster.find((c) => c.id === pendingId) : null;

  if (!cryptid) {
    return (
      <div className="p-4 max-w-lg mx-auto space-y-6 animate-slide-up text-center">
        <h1 className="font-display text-2xl font-bold text-white">Flashlight Hunt</h1>
        <p className="text-bark-light">No cryptid is ready for capture yet. Keep investigating!</p>
        <Link
          to="/"
          className="inline-block rounded-2xl px-8 py-4 font-display font-bold text-lg text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, #00c896 0%, #00a67a 100%)',
            boxShadow: '0 4px 0 #008060, 0 0 20px rgba(0,200,150,0.2)',
            border: '2px solid rgba(255,255,255,0.15)',
          }}
        >
          Back to Base
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-lg mx-auto space-y-6 animate-slide-up">
      <div
        className="rounded-2xl p-6 text-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, rgba(255,184,0,0.12) 0%, rgba(255,140,0,0.08) 100%)',
          border: '2px solid rgba(255,184,0,0.4)',
          boxShadow: '0 0 40px rgba(255,184,0,0.15), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
      >
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl p-2 flex items-center justify-center" style={{ background: 'rgba(255,184,0,0.15)', border: '2px solid rgba(255,184,0,0.3)' }}>
          <img src={cryptid.svgSilhouette} alt="" className="w-full h-full opacity-90" />
        </div>
        <h1 className="font-display text-2xl font-bold text-gold mb-2">Capture: {cryptid.name}</h1>
        <p className="text-bark-light text-sm mb-1">{cryptid.region}</p>
        <p className="text-gold-light text-sm mt-3">
          You are close to capturing the {cryptid.name}!
        </p>
        <p className="text-bark-light text-xs mt-1">
          Enter the swamp and find the final clues to make the capture!
        </p>
      </div>

      <Link
        to="/dungeon/play"
        className="block rounded-2xl p-5 text-center font-display font-bold text-xl text-white min-h-[56px] flex items-center justify-center transition-all hover:scale-[1.02] active:scale-[0.98] animate-hero-pulse"
        style={{
          background: 'linear-gradient(135deg, #FFB800 0%, #FF8C00 100%)',
          boxShadow: '0 4px 0 #CC7000, 0 0 30px rgba(255,184,0,0.3)',
          border: '2px solid rgba(255,255,255,0.2)',
        }}
      >
        Enter the Swamp
      </Link>

      <Link
        to="/"
        className="block text-center text-bark-light text-sm hover:text-white transition-colors"
      >
        Back to Base
      </Link>
    </div>
  );
}
