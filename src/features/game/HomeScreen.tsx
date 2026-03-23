import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGameStore } from '../../hooks/useGameStore';
import { useTheme } from '../themes/engine/ThemeContext';
import { cryptidRoster } from '../themes/cryptids/cryptidTheme';
import { Avatar } from '../avatar/Avatar';
import { CryptidRevealModal } from '../progress/CryptidRevealModal';
import type { Cryptid } from '../../types';

export function HomeScreen() {
  const { profile, progress } = useGameStore();
  const { getNarrative } = useTheme();
  const [selectedCryptid, setSelectedCryptid] = useState<Cryptid | null>(null);

  if (!profile) return null;

  const activeInv = progress.activeInvestigation;
  const invProgress = activeInv ? progress.investigationProgress[activeInv] : null;
  const activeCryptid = activeInv ? cryptidRoster.find((c) => c.id === activeInv) : null;
  const pendingCryptid = progress.pendingCapture ? cryptidRoster.find((c) => c.id === progress.pendingCapture) : null;

  const today = new Date().toISOString().slice(0, 10);
  const isNewDay = progress.lastPlayDate !== today;
  const allDiscovered = progress.discoveredCryptids.length === cryptidRoster.length;

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4 animate-slide-up">
      {/* Hero welcome banner */}
      <div
        className="rounded-2xl p-5 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(0,200,150,0.15) 0%, rgba(0,100,80,0.2) 100%)',
          border: '1.5px solid rgba(0,200,150,0.2)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
      >
        <div className="flex items-center gap-4">
          <Link to="/avatar" aria-label="Customize avatar" className="flex-shrink-0 animate-float">
            <Avatar size={90} />
          </Link>
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-2xl font-bold text-white mb-1" style={{ textShadow: '0 0 20px rgba(0,200,150,0.3)' }}>
              Welcome back, {profile.name}!
            </h2>
            <p className="text-sm text-bark-light">{getNarrative('welcome')}</p>
          </div>
        </div>
      </div>

      {/* Daily login reward */}
      {isNewDay && (
        <div
          className="rounded-2xl p-4 text-center animate-bounce-in"
          style={{
            background: 'rgba(255,184,0,0.1)',
            border: '2px solid rgba(255,184,0,0.4)',
            boxShadow: '0 0 24px rgba(255,184,0,0.1)',
          }}
        >
          <p className="font-bold text-gold text-lg font-display">Daily Field Supply!</p>
          <p className="text-sm text-bark-light mt-1">{getNarrative('daily_login')}</p>
        </div>
      )}

      {/* Daily streak */}
      {progress.dailyStreak > 0 && (
        <div className="flex items-center justify-center gap-3 py-3">
          <span className="animate-fire text-4xl" aria-hidden="true">🔥</span>
          <div
            className="text-center px-5 py-2 rounded-2xl"
            style={{
              background: 'rgba(255,184,0,0.1)',
              border: '1px solid rgba(255,184,0,0.2)',
              boxShadow: '0 0 20px rgba(255,184,0,0.1)',
            }}
          >
            <div className="font-display font-bold text-3xl text-gold" style={{ textShadow: '0 0 16px rgba(255,184,0,0.4)' }}>{progress.dailyStreak}</div>
            <div className="text-xs text-gold-light font-bold uppercase tracking-wider">Day Streak</div>
          </div>
          <span className="animate-fire text-4xl" aria-hidden="true">🔥</span>
        </div>
      )}

      {/* Capture ready card */}
      {pendingCryptid && (
        <Link
          to="/dungeon"
          className="block rounded-2xl p-5 relative overflow-hidden transition-all hover:scale-[1.01] active:scale-[0.99]"
          style={{
            background: 'linear-gradient(135deg, rgba(255,184,0,0.15) 0%, rgba(255,140,0,0.1) 100%)',
            border: '2px solid rgba(255,184,0,0.5)',
            boxShadow: '0 0 40px rgba(255,184,0,0.15), 0 0 80px rgba(255,184,0,0.05)',
            animation: 'glow-pulse 2s ease-in-out infinite',
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-xl p-2 flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(255,184,0,0.2)', border: '2px solid rgba(255,184,0,0.3)' }}
            >
              <img src={pendingCryptid.svgSilhouette} alt="" className="w-full h-full animate-float" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display font-bold text-gold text-xs uppercase tracking-wider mb-0.5">CAPTURE READY!</div>
              <h3 className="font-display font-bold text-white text-lg leading-tight">
                The {pendingCryptid.name} has been spotted!
              </h3>
              <p className="text-bark-light text-xs mt-1">Enter the swamp to make the capture!</p>
            </div>
          </div>
          <div
            className="mt-3 rounded-xl py-2.5 text-center font-display font-bold text-sm text-white"
            style={{
              background: 'linear-gradient(135deg, #FFB800 0%, #FF8C00 100%)',
              boxShadow: '0 2px 0 #CC7000',
            }}
          >
            Enter Flashlight Hunt
          </div>
        </Link>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2" role="group" aria-label="Player statistics">
        <StatCard label="XP" value={progress.xp.toLocaleString()} icon="/assets/ui/xp-star.svg" color="0, 200, 150" />
        <StatCard label="Level" value={String(progress.level)} icon="/assets/ui/streak-fire.svg" color="255, 184, 0" />
        <StatCard label="Evidence" value={String(progress.evidencePieces)} icon="/assets/ui/evidence-magnifier.svg" color="129, 140, 248" />
      </div>

      {/* Current investigation */}
      {activeCryptid && invProgress && !invProgress.completed && (
        <div
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(8px)',
            border: '1.5px solid rgba(0,200,150,0.15)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-14 h-14 rounded-xl p-1.5 flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(0,200,150,0.1)', border: '1px solid rgba(0,200,150,0.2)' }}
            >
              <img src={activeCryptid.svgSilhouette} alt="" className="w-full h-full opacity-80" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-bold text-forest text-lg">Investigating: {activeCryptid.name}</h3>
              <p className="text-xs text-bark-light">{activeCryptid.region}</p>
            </div>
          </div>
          {/* Clues display */}
          {invProgress.totalClues <= 5 ? (
            <>
              <div className="flex gap-2 mb-2 justify-center" aria-label={`${invProgress.cluesFound} of ${invProgress.totalClues} Clues Found`}>
                {Array.from({ length: invProgress.totalClues }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      i < invProgress.cluesFound
                        ? 'text-white animate-bounce-in'
                        : 'text-bark-light'
                    }`}
                    style={i < invProgress.cluesFound
                      ? { background: 'linear-gradient(135deg, #00c896, #00a67a)', boxShadow: '0 0 10px rgba(0,200,150,0.3)', animationDelay: `${i * 100}ms` }
                      : { background: 'rgba(255,255,255,0.08)' }
                    }
                    aria-hidden="true"
                  >
                    {i < invProgress.cluesFound ? '✓' : '?'}
                  </div>
                ))}
              </div>
              <p className="text-xs text-bark-light mt-1 text-center">
                {invProgress.cluesFound} / {invProgress.totalClues} Clues Found
              </p>
            </>
          ) : (
            <div>
              <div
                className="w-full rounded-full h-3.5 overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.08)' }}
                role="progressbar"
                aria-valuenow={invProgress.cluesFound}
                aria-valuemax={invProgress.totalClues}
                aria-label="Clues progress"
              >
                <div
                  className="h-full rounded-full transition-all duration-700 animate-progress"
                  style={{
                    width: `${(invProgress.cluesFound / invProgress.totalClues) * 100}%`,
                    background: 'linear-gradient(90deg, #00c896, #00a67a)',
                    boxShadow: '0 0 12px rgba(0,200,150,0.3)',
                  }}
                />
              </div>
              <p className="text-xs text-bark-light mt-1 text-center">
                {invProgress.cluesFound} / {invProgress.totalClues} Clues Found
              </p>
            </div>
          )}
        </div>
      )}

      {/* All cryptids discovered celebration */}
      {allDiscovered && (
        <div
          className="rounded-2xl p-5 text-center animate-glow-pulse"
          style={{
            background: 'rgba(255,184,0,0.1)',
            border: '2px solid rgba(255,184,0,0.4)',
            boxShadow: '0 0 30px rgba(255,184,0,0.15)',
          }}
        >
          <div className="text-4xl mb-2">🏆</div>
          <h3 className="font-display text-xl font-bold text-gold">Master Investigator!</h3>
          <p className="text-xs text-bark-light mt-1">All {cryptidRoster.length} cryptids discovered!</p>
        </div>
      )}

      {/* Quick play CTA — hero button */}
      <Link
        to="/play"
        className="block rounded-2xl p-5 text-center font-display font-bold text-xl text-white min-h-[56px] flex items-center justify-center transition-all hover:scale-[1.02] active:scale-[0.98] animate-hero-pulse"
        style={{
          background: 'linear-gradient(135deg, #00c896 0%, #00a67a 100%)',
          boxShadow: '0 4px 0 #008060, 0 0 30px rgba(0,200,150,0.3)',
          border: '2px solid rgba(255,255,255,0.15)',
        }}
        aria-label="Start an investigation mission"
      >
        Start Investigation!
      </Link>

      {/* Minigames */}
      <div
        className="rounded-2xl p-4"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1.5px solid rgba(0,200,150,0.15)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        }}
      >
        <h3 className="font-display font-bold text-forest mb-3">Swamp Games</h3>
        <div className="grid grid-cols-3 gap-2">
          <Link
            to="/minigames/shredder"
            className="rounded-xl p-3 text-center transition-all hover:scale-105 active:scale-95"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,184,0,0.2)' }}
          >
            <div className="text-2xl mb-1">🔍</div>
            <div className="text-xs font-bold text-bark-light">Myth Buster</div>
          </Link>
          <Link
            to="/minigames/caller"
            className="rounded-xl p-3 text-center transition-all hover:scale-105 active:scale-95"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(129,140,248,0.2)' }}
          >
            <div className="text-2xl mb-1">📡</div>
            <div className="text-xs font-bold text-bark-light">Cryptid Caller</div>
          </Link>
          <Link
            to="/minigames/swamp-escape"
            className="rounded-xl p-3 text-center transition-all hover:scale-105 active:scale-95"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(0,200,200,0.2)' }}
          >
            <div className="text-2xl mb-1">🏞️</div>
            <div className="text-xs font-bold text-bark-light">Swamp Escape</div>
          </Link>
        </div>
      </div>

      <CryptidRevealModal cryptid={selectedCryptid} onClose={() => setSelectedCryptid(null)} />

      {/* Cryptids discovered */}
      {progress.discoveredCryptids.length > 0 && (
        <div
          className="rounded-2xl p-4"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1.5px solid rgba(0,200,150,0.15)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          }}
        >
          <h3 className="font-display font-bold text-forest mb-3">Field Guide</h3>
          <div className="flex gap-3 flex-wrap">
            {progress.discoveredCryptids.map((id) => {
              const c = cryptidRoster.find((cr) => cr.id === id);
              return c ? (
                <button
                  key={id}
                  className="w-14 h-14 rounded-xl p-1.5 transition-all hover:scale-110 cursor-pointer relative group"
                  style={{
                    background: 'rgba(255,184,0,0.1)',
                    border: '2px solid rgba(255,184,0,0.3)',
                  }}
                  title={c.name}
                  aria-label={`View ${c.name}`}
                  onClick={() => setSelectedCryptid(c)}
                >
                  <img src={c.svgSilhouette} alt={c.name} className="w-full h-full" />
                  <span className="absolute inset-0 flex items-end justify-center pb-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-[8px] text-gold font-bold">Tap</span>
                </button>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  return (
    <div
      className="rounded-xl p-3 text-center"
      style={{
        background: `rgba(${color}, 0.08)`,
        border: `1.5px solid rgba(${color}, 0.2)`,
        boxShadow: `0 4px 16px rgba(${color}, 0.08)`,
      }}
      aria-label={`${label}: ${value}`}
    >
      <img src={icon} alt="" className="w-7 h-7 mx-auto mb-1" aria-hidden="true" />
      <div className="font-bold text-white text-xl animate-count-up">{value}</div>
      <div className="text-xs text-bark-light font-bold">{label}</div>
    </div>
  );
}
