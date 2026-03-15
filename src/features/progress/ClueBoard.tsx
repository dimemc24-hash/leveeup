import { useState, useEffect } from 'react';
import { useGameStore } from '../../hooks/useGameStore';
import { cryptidRoster } from '../themes/cryptids/cryptidTheme';
import { CryptidRevealModal } from './CryptidRevealModal';
import type { Cryptid } from '../../types';

export function ClueBoard() {
  const { progress } = useGameStore();
  const activeId = progress.activeInvestigation;
  const activeCryptid = activeId ? cryptidRoster.find((c) => c.id === activeId) : null;
  const invProgress = activeId ? progress.investigationProgress[activeId] : null;
  const [revealPhase, setRevealPhase] = useState<'none' | 'assembling' | 'identifying' | 'discovered'>('none');
  const [modalCryptid, setModalCryptid] = useState<Cryptid | null>(null);

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

  // For display: whether all cryptids are done
  const allDiscovered = progress.discoveredCryptids.length === cryptidRoster.length;

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4 animate-slide-up">
      <div className="journal-card bg-white/90 rounded-2xl p-5 shadow-sm">
        <h2 className="font-display text-xl font-bold text-forest">Field Journal</h2>
        <p className="text-sm text-bark-light mt-1">Your investigation clue board</p>
        <p className="text-xs text-bark-light mt-1">Total evidence collected: <span className="font-bold text-gold">{progress.evidencePieces}</span></p>
      </div>

      {activeCryptid && isCompleted && isDiscovered ? (
        <div className="space-y-3">
          {revealPhase === 'assembling' && (
            <div className="bg-white rounded-2xl p-5 shadow-lg border-2 border-gold text-center animate-bounce-in">
              <p className="text-sm text-bark-light font-bold mb-3">Assembling evidence...</p>
              <div className="flex justify-center gap-2 flex-wrap">
                {activeCryptid.clues.map((clue, i) => (
                  <div
                    key={clue.id}
                    className="w-10 h-10 bg-forest/10 rounded-lg flex items-center justify-center animate-bounce-in"
                    style={{ animationDelay: `${i * 150}ms` }}
                  >
                    <img src={clue.svgIcon} alt="" className="w-6 h-6" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {revealPhase === 'identifying' && (
            <div className="bg-gold/10 rounded-2xl p-6 border-2 border-gold text-center animate-glow-pulse">
              <div className="relative w-32 h-32 mx-auto mb-3">
                <img src={activeCryptid.svgSilhouette} alt="" className="w-full h-full opacity-30" />
              </div>
              <p className="font-display text-lg font-bold text-gold">Identifying creature...</p>
            </div>
          )}

          {revealPhase === 'discovered' && (
            <div className="bg-white rounded-2xl p-5 shadow-lg border-2 border-gold text-center discovery-reveal">
              <p className="font-display text-sm font-bold text-gold mb-3">CRYPTID DISCOVERED!</p>
              <div className="relative mx-auto mb-4 rounded-xl overflow-hidden" style={{ boxShadow: '0 0 30px rgba(212, 168, 67, 0.5)' }}>
                <img
                  src={activeCryptid.revealImage}
                  alt={activeCryptid.name}
                  className="w-full max-h-64 object-cover"
                />
              </div>
              <h3 className="font-display text-2xl font-bold text-forest">{activeCryptid.name}</h3>
              <p className="text-xs text-bark-light">{activeCryptid.region}</p>
              <p className="text-sm text-bark mt-2">{activeCryptid.description}</p>
            </div>
          )}
        </div>
      ) : activeCryptid && invProgress && !isCompleted ? (
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

            {/* Evidence progress bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-bark-light mb-1">
                <span>Evidence collected</span>
                <span className="font-bold">{invProgress.evidenceCollected} / {activeCryptid.evidenceRequired}</span>
              </div>
              <div className="w-full bg-paper-dark rounded-full h-3 overflow-hidden" role="progressbar" aria-valuenow={invProgress.evidenceCollected} aria-valuemax={activeCryptid.evidenceRequired}>
                <div className="bg-gold h-full rounded-full transition-all duration-500" style={{ width: `${(invProgress.evidenceCollected / activeCryptid.evidenceRequired) * 100}%` }} />
              </div>
              <p className="text-[10px] text-bark-light mt-1 text-center">
                Answer 10 questions to earn 1 evidence piece
              </p>
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
        </>
      ) : allDiscovered ? (
        <div className="journal-card bg-gold/10 border-2 border-gold rounded-2xl p-8 shadow-sm text-center space-y-3">
          <div className="text-5xl">🏆</div>
          <h3 className="font-display text-2xl font-bold text-gold">Master Investigator!</h3>
          <p className="text-sm text-bark-light">You've discovered ALL {cryptidRoster.length} cryptids! You are a legend!</p>
        </div>
      ) : (
        <div className="journal-card bg-white/90 rounded-2xl p-8 shadow-sm text-center">
          <p className="text-bark-light">No active investigation. Start playing to begin!</p>
        </div>
      )}

      <CryptidRevealModal cryptid={modalCryptid} onClose={() => setModalCryptid(null)} />

      {/* All investigations */}
      <div className="journal-card bg-white/90 rounded-2xl p-4 shadow-sm">
        <h3 className="font-display font-bold text-forest mb-3">All Investigations</h3>
        <div className="space-y-2">
          {cryptidRoster.map((cryptid) => {
            const unlocked = progress.unlockedCryptids.includes(cryptid.id);
            const discovered = progress.discoveredCryptids.includes(cryptid.id);
            const inv = progress.investigationProgress[cryptid.id];
            const isActive = cryptid.id === activeId;

            return (
              <div
                key={cryptid.id}
                className={`flex items-center gap-3 p-2 rounded-lg ${
                  discovered ? 'bg-gold/10 cursor-pointer hover:bg-gold/20 transition-colors' : isActive ? 'bg-forest/5 border border-forest/20' : unlocked ? 'bg-paper' : 'opacity-40'
                }`}
                onClick={() => discovered ? setModalCryptid(cryptid) : undefined}
                role={discovered ? 'button' : undefined}
                aria-label={discovered ? `View ${cryptid.name}` : undefined}
              >
                <div className="w-8 h-8">
                  {discovered ? (
                    <img
                      src={cryptid.revealImage}
                      alt=""
                      className="w-full h-full rounded object-cover"
                    />
                  ) : (
                    <img
                      src={cryptid.svgSilhouette}
                      alt=""
                      className={`w-full h-full ${unlocked ? '' : 'blur-sm'}`}
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-bark">
                    {unlocked ? cryptid.name : '???'}
                  </div>
                  <div className="text-xs text-bark-light">
                    {discovered
                      ? 'Discovered!'
                      : inv
                        ? `${inv.evidenceCollected}/${cryptid.evidenceRequired} evidence`
                        : unlocked
                          ? `${cryptid.evidenceRequired} evidence needed`
                          : 'Locked'}
                  </div>
                </div>
                {discovered && <span className="text-gold">⭐</span>}
                {isActive && !discovered && <span className="text-forest text-xs font-bold">Active</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
