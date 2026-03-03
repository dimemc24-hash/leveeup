import { useState } from 'react';
import { useGameStore } from '../../hooks/useGameStore';
import { cryptidRoster } from '../themes/cryptids/cryptidTheme';

type LoreTab = 'overview' | 'sightings' | 'facts' | 'fieldnotes';

export function FieldGuide() {
  const { progress } = useGameStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loreTab, setLoreTab] = useState<LoreTab>('overview');
  const [revealStage, setRevealStage] = useState<'idle' | 'clues' | 'pause' | 'reveal'>('idle');

  const selected = selectedId ? cryptidRoster.find((c) => c.id === selectedId) : null;
  const isDiscovered = selected ? progress.discoveredCryptids.includes(selected.id) : false;

  const handleCryptidClick = (id: string) => {
    const discovered = progress.discoveredCryptids.includes(id);
    if (!discovered) return;

    // Multi-step reveal animation
    setSelectedId(id);
    setRevealStage('clues');
    setLoreTab('overview');
    setTimeout(() => setRevealStage('pause'), 800);
    setTimeout(() => setRevealStage('reveal'), 1500);
  };

  const handleBack = () => {
    setSelectedId(null);
    setRevealStage('idle');
    setLoreTab('overview');
  };

  const tabs: { id: LoreTab; label: string }[] = [
    { id: 'overview', label: 'Origin' },
    { id: 'sightings', label: 'Sightings' },
    { id: 'facts', label: 'Fun Facts' },
    { id: 'fieldnotes', label: 'Field Notes' },
  ];

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4 animate-slide-up">
      <div className="journal-card bg-white/90 rounded-2xl p-5 shadow-sm">
        <h2 className="font-display text-xl font-bold text-forest">Field Guide</h2>
        <p className="text-sm text-bark-light mt-1">
          {progress.discoveredCryptids.length} / {cryptidRoster.length} cryptids discovered
        </p>
      </div>

      {/* Cryptid detail view */}
      {selected && isDiscovered && (
        <div className="space-y-3">
          {/* Clue assembly stage */}
          {revealStage === 'clues' && (
            <div className="bg-white rounded-2xl p-5 shadow-lg border-2 border-gold text-center animate-bounce-in">
              <p className="text-sm text-bark-light font-bold mb-3">Assembling clues...</p>
              <div className="flex justify-center gap-2 flex-wrap">
                {selected.clues.map((clue, i) => (
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

          {/* Dramatic pause */}
          {revealStage === 'pause' && (
            <div className="bg-gold/10 rounded-2xl p-6 border-2 border-gold text-center animate-glow-pulse">
              <div className="text-3xl mb-2">🔍</div>
              <p className="font-display text-lg font-bold text-gold">Identifying creature...</p>
            </div>
          )}

          {/* Full reveal */}
          {revealStage === 'reveal' && (
            <>
              <div className="bg-white rounded-2xl p-5 shadow-lg border-2 border-gold discovery-reveal">
                <button onClick={handleBack} className="text-bark-light text-sm mb-3 min-h-[44px]" aria-label="Back to list">
                  ← Back to Field Guide
                </button>

                <div className="text-center mb-4">
                  <img src={selected.svgSilhouette} alt={selected.name} className="w-32 h-32 mx-auto mb-3" />
                  <h3 className="font-display text-2xl font-bold text-forest">{selected.name}</h3>
                  <p className="text-xs text-bark-light">{selected.region}</p>
                  <p className="text-sm text-bark mt-2">{selected.description}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {Object.entries(selected.cardStats).map(([stat, value]) => (
                    <div key={stat} className="bg-paper rounded-lg p-2">
                      <div className="text-xs text-bark-light capitalize">{stat}</div>
                      <div className="flex gap-0.5 justify-center mt-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-3 h-3 rounded-full ${i < value ? 'bg-forest-light' : 'bg-paper-dark'}`}
                            aria-hidden="true"
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Louisiana Connection */}
                {selected.lore.louisianaConnection && (
                  <div className="bg-gold/10 border border-gold/30 rounded-xl p-3 mb-4">
                    <p className="text-xs font-bold text-gold mb-1">Louisiana Connection</p>
                    <p className="text-xs text-bark leading-relaxed">{selected.lore.louisianaConnection}</p>
                  </div>
                )}
              </div>

              {/* Lore tabs */}
              <div className="flex gap-1 overflow-x-auto pb-1" role="tablist" aria-label="Lore sections">
                {tabs.map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setLoreTab(id)}
                    className={`px-4 py-2 rounded-full text-sm min-h-[40px] font-bold whitespace-nowrap transition-colors ${
                      loreTab === id
                        ? 'bg-forest text-white'
                        : 'bg-white text-bark-light border border-paper-dark hover:bg-paper'
                    }`}
                    role="tab"
                    aria-selected={loreTab === id}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Lore content */}
              <div className="journal-card bg-white/90 rounded-2xl p-5 shadow-sm animate-slide-up">
                {loreTab === 'overview' && (
                  <div className="space-y-3">
                    <h4 className="font-display font-bold text-forest">Origin Story</h4>
                    {selected.lore.originStory.split('\n\n').map((p, i) => (
                      <p key={i} className="text-sm text-bark leading-relaxed">{p}</p>
                    ))}
                  </div>
                )}

                {loreTab === 'sightings' && (
                  <div className="space-y-3">
                    <h4 className="font-display font-bold text-forest">Famous Sightings</h4>
                    <div className="space-y-2">
                      {selected.lore.famousSightings.map((sighting, i) => (
                        <div key={i} className="flex gap-2 items-start">
                          <div className="w-5 h-5 rounded-full bg-forest/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-[10px] text-forest font-bold">{i + 1}</span>
                          </div>
                          <p className="text-sm text-bark leading-relaxed">{sighting}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {loreTab === 'facts' && (
                  <div className="space-y-3">
                    <h4 className="font-display font-bold text-forest">Fun Facts</h4>
                    <div className="space-y-2">
                      {selected.lore.funFacts.map((fact, i) => (
                        <div key={i} className="bg-paper rounded-lg p-3">
                          <p className="text-sm text-bark leading-relaxed">{fact}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {loreTab === 'fieldnotes' && (
                  <div className="space-y-3">
                    <h4 className="font-display font-bold text-forest">Field Notes</h4>
                    <div className="bg-paper rounded-xl p-4 border border-paper-dark paper-texture">
                      <p className="text-sm text-bark leading-relaxed italic font-display">{selected.lore.fieldNotes}</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Grid */}
      {!selectedId && (
        <div className="grid grid-cols-2 gap-3">
          {cryptidRoster.map((cryptid) => {
            const discovered = progress.discoveredCryptids.includes(cryptid.id);
            const unlocked = progress.unlockedCryptids.includes(cryptid.id);

            return (
              <button
                key={cryptid.id}
                onClick={() => discovered ? handleCryptidClick(cryptid.id) : undefined}
                disabled={!discovered}
                className={`bg-white rounded-xl p-4 shadow-sm border text-center transition-all min-h-[48px] ${
                  discovered
                    ? 'border-gold hover:shadow-md cursor-pointer'
                    : unlocked
                    ? 'border-paper-dark opacity-60'
                    : 'border-paper-dark opacity-30'
                }`}
                aria-label={discovered ? `View ${cryptid.name}` : unlocked ? `${cryptid.name} - not yet discovered` : 'Locked cryptid'}
              >
                <img
                  src={cryptid.svgSilhouette}
                  alt=""
                  className={`w-16 h-16 mx-auto mb-2 ${discovered ? '' : 'blur-sm grayscale'}`}
                />
                <div className="font-bold text-sm text-bark">
                  {unlocked ? cryptid.name : '???'}
                </div>
                <div className="text-xs text-bark-light">
                  {discovered ? 'Discovered!' : unlocked ? 'Investigating...' : 'Locked'}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
