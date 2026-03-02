import { useState } from 'react';
import { useGameStore } from '../../hooks/useGameStore';
import { cryptidRoster } from '../themes/cryptids/cryptidTheme';

export function FieldGuide() {
  const { progress } = useGameStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = selectedId ? cryptidRoster.find((c) => c.id === selectedId) : null;

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4 animate-slide-up">
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-paper-dark">
        <h2 className="font-display text-xl font-bold text-forest">Field Guide</h2>
        <p className="text-sm text-bark-light mt-1">
          {progress.discoveredCryptids.length} / {cryptidRoster.length} cryptids discovered
        </p>
      </div>

      {/* Cryptid card detail */}
      {selected && progress.discoveredCryptids.includes(selected.id) && (
        <div className="bg-white rounded-2xl p-5 shadow-lg border-2 border-gold animate-bounce-in">
          <button onClick={() => setSelectedId(null)} className="text-bark-light text-sm mb-2" aria-label="Close card">← Back</button>
          <div className="text-center">
            <img src={selected.svgSilhouette} alt={selected.name} className="w-32 h-32 mx-auto mb-3" />
            <h3 className="font-display text-2xl font-bold text-forest">{selected.name}</h3>
            <p className="text-xs text-bark-light">{selected.region}</p>
            <p className="text-sm text-bark mt-3">{selected.description}</p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mt-4">
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
          </div>
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
                onClick={() => discovered ? setSelectedId(cryptid.id) : undefined}
                disabled={!discovered}
                className={`bg-white rounded-xl p-4 shadow-sm border text-center transition-all ${
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
