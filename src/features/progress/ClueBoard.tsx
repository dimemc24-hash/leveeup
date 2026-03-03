import { useState, useEffect } from 'react';
import { useGameStore } from '../../hooks/useGameStore';
import { cryptidRoster } from '../themes/cryptids/cryptidTheme';

export function ClueBoard() {
  const { progress } = useGameStore();
  const activeId = progress.activeInvestigation;
  const activeCryptid = activeId ? cryptidRoster.find((c) => c.id === activeId) : null;
  const invProgress = activeId ? progress.investigationProgress[activeId] : null;
  const [revealPhase, setRevealPhase] = useState<'none' | 'assembling' | 'identifying' | 'discovered'>('none');

  const isCompleted = invProgress?.completed ?? false;
  const isDiscovered = activeId ? progress.discoveredCryptids.includes(activeId) : false;

  useEffect(() => {
    if (isCompleted && isDiscovered) {
      setRevealPhase('assembling');
      const t1 = setTimeout(() => setRevealPhase('identifying'), 1200);
      const t2 = setTimeout(() => setRevealPhase('discovered'), 2200);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [isCompleted, isDiscovered]);

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4 animate-slide-up">
      <div className="journal-card bg-white/90 rounded-2xl p-5 shadow-sm">
        <h2 className="font-display text-xl font-bold text-forest">Field Journal</h2>
        <p className="text-sm text-bark-light mt-1">Your investigation clue board</p>
      </div>

      {activeCryptid && invProgress ? (
        <>
          {/* Active investigation */}
          <div className="journal-card bg-white/90 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-paper rounded-xl flex items-center justify-center p-2">
                <img src={activeCryptid.svgSilhouette} alt="" className="w-full h-full opacity-50" />
              </div>
              <div>
                <h3 className="font-display font-bold text-forest text-lg">{activeCryptid.name}</h3>
                <p className="text-xs text-bark-light">{activeCryptid.region}</p>
                <p className="text-xs text-bark-light mt-1">{activeCryptid.description}</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-bark-light mb-1">
                <span>Evidence collected</span>
                <span>{invProgress.evidenceCollected} / {invProgress.evidenceNeeded}</span>
              </div>
              <div className="w-full bg-paper-dark rounded-full h-3 overflow-hidden" role="progressbar" aria-valuenow={invProgress.evidenceCollected} aria-valuemax={invProgress.evidenceNeeded}>
                <div className="bg-gold h-full rounded-full transition-all duration-500" style={{ width: `${(invProgress.evidenceCollected / invProgress.evidenceNeeded) * 100}%` }} />
              </div>
            </div>

            {/* Clue slots */}
            <div className="grid grid-cols-5 gap-2">
              {activeCryptid.clues.slice(0, invProgress.totalClues).map((clue, i) => {
                const revealed = i < invProgress.cluesFound;
                return (
                  <div
                    key={clue.id}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center p-1 transition-all ${
                      revealed
                        ? 'bg-forest/10 border-2 border-forest-light animate-card-flip'
                        : 'bg-paper-dark border-2 border-paper-dark'
                    }`}
                    title={revealed ? clue.description : '???'}
                    aria-label={revealed ? `Clue: ${clue.description}` : 'Undiscovered clue'}
                  >
                    {revealed ? (
                      <>
                        <img src={clue.svgIcon} alt="" className="w-6 h-6" />
                        <span className="text-[8px] text-forest mt-0.5 text-center leading-tight">{clue.type}</span>
                      </>
                    ) : (
                      <span className="text-bark-light text-lg">?</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Multi-step discovery reveal */}
          {isCompleted && revealPhase === 'assembling' && (
            <div className="bg-forest/5 border-2 border-forest rounded-2xl p-5 text-center animate-bounce-in">
              <p className="font-display font-bold text-forest mb-3">Assembling evidence...</p>
              <div className="flex justify-center gap-2">
                {activeCryptid.clues.slice(0, invProgress.totalClues).map((clue, i) => (
                  <div
                    key={clue.id}
                    className="w-8 h-8 bg-forest/10 rounded-lg flex items-center justify-center animate-bounce-in"
                    style={{ animationDelay: `${i * 200}ms` }}
                  >
                    <img src={clue.svgIcon} alt="" className="w-5 h-5" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {isCompleted && revealPhase === 'identifying' && (
            <div className="bg-gold/10 border-2 border-gold rounded-2xl p-6 text-center animate-glow-pulse">
              <div className="text-4xl mb-2">🔍</div>
              <p className="font-display text-xl font-bold text-gold">Identifying creature...</p>
            </div>
          )}

          {isCompleted && revealPhase === 'discovered' && (
            <div className="bg-gold/10 border-2 border-gold rounded-2xl p-5 text-center discovery-reveal space-y-3">
              <div className="text-4xl mb-1">🎉</div>
              <h3 className="font-display text-2xl font-bold text-gold">Cryptid Discovered!</h3>
              <p className="text-sm text-bark-light">You've identified the {activeCryptid.name}!</p>
              <img src={activeCryptid.svgSilhouette} alt={activeCryptid.name} className="w-28 h-28 mx-auto" />
              <div className="bg-white rounded-xl p-3 text-left">
                <p className="text-xs text-bark leading-relaxed italic">{activeCryptid.lore.fieldNotes}</p>
              </div>
              <p className="text-xs text-bark-light">Visit the Field Guide for the full investigation report!</p>
            </div>
          )}
        </>
      ) : (
        <div className="journal-card bg-white/90 rounded-2xl p-8 shadow-sm text-center">
          <p className="text-bark-light">No active investigation. Start playing to begin!</p>
        </div>
      )}

      {/* All investigations */}
      <div className="journal-card bg-white/90 rounded-2xl p-4 shadow-sm">
        <h3 className="font-display font-bold text-forest mb-3">All Investigations</h3>
        <div className="space-y-2">
          {cryptidRoster.map((cryptid) => {
            const unlocked = progress.unlockedCryptids.includes(cryptid.id);
            const discovered = progress.discoveredCryptids.includes(cryptid.id);
            const inv = progress.investigationProgress[cryptid.id];

            return (
              <div
                key={cryptid.id}
                className={`flex items-center gap-3 p-2 rounded-lg ${
                  discovered ? 'bg-gold/10' : unlocked ? 'bg-paper' : 'opacity-40'
                }`}
              >
                <div className="w-8 h-8">
                  <img
                    src={cryptid.svgSilhouette}
                    alt=""
                    className={`w-full h-full ${unlocked ? '' : 'blur-sm'}`}
                  />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-bark">
                    {unlocked ? cryptid.name : '???'}
                  </div>
                  <div className="text-xs text-bark-light">
                    {discovered ? 'Discovered!' : inv ? `${inv.cluesFound}/${inv.totalClues} clues` : 'Locked'}
                  </div>
                </div>
                {discovered && <span className="text-gold">⭐</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
