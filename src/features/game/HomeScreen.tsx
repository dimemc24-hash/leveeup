import { Link } from 'react-router-dom';
import { useGameStore } from '../../hooks/useGameStore';
import { useTheme } from '../themes/engine/ThemeContext';
import { cryptidRoster } from '../themes/cryptids/cryptidTheme';

export function HomeScreen() {
  const { profile, progress } = useGameStore();
  const { getNarrative } = useTheme();

  if (!profile) return null;

  const activeInv = progress.activeInvestigation;
  const invProgress = activeInv ? progress.investigationProgress[activeInv] : null;
  const activeCryptid = activeInv ? cryptidRoster.find((c) => c.id === activeInv) : null;

  const today = new Date().toISOString().slice(0, 10);
  const isNewDay = progress.lastPlayDate !== today;

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4 animate-slide-up">
      {/* Welcome */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-paper-dark">
        <h2 className="font-display text-xl font-bold text-forest mb-1">
          Welcome back, {profile.name}!
        </h2>
        <p className="text-sm text-bark-light">{getNarrative('welcome')}</p>
      </div>

      {/* Daily login reward */}
      {isNewDay && (
        <div className="bg-gold/10 border-2 border-gold rounded-2xl p-4 text-center animate-bounce-in">
          <p className="font-bold text-gold">Daily Field Supply!</p>
          <p className="text-sm text-bark-light mt-1">{getNarrative('daily_login')}</p>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard label="XP" value={progress.xp.toLocaleString()} icon="/assets/ui/xp-star.svg" />
        <StatCard label="Streak" value={`${progress.dailyStreak}d`} icon="/assets/ui/streak-fire.svg" />
        <StatCard label="Evidence" value={String(progress.evidencePieces)} icon="/assets/ui/evidence-magnifier.svg" />
      </div>

      {/* Current investigation */}
      {activeCryptid && invProgress && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-paper-dark">
          <div className="flex items-center gap-3 mb-3">
            <img src={activeCryptid.svgSilhouette} alt="" className="w-12 h-12 opacity-60" />
            <div>
              <h3 className="font-display font-bold text-forest">Investigating: {activeCryptid.name}</h3>
              <p className="text-xs text-bark-light">{activeCryptid.region}</p>
            </div>
          </div>
          <div className="w-full bg-paper-dark rounded-full h-3 overflow-hidden" role="progressbar" aria-valuenow={invProgress.cluesFound} aria-valuemax={invProgress.totalClues} aria-label="Investigation progress">
            <div
              className="bg-forest-light h-full rounded-full transition-all duration-500"
              style={{ width: `${(invProgress.cluesFound / invProgress.totalClues) * 100}%` }}
            />
          </div>
          <p className="text-xs text-bark-light mt-1">
            {invProgress.cluesFound} / {invProgress.totalClues} clues found
          </p>
        </div>
      )}

      {/* Quick play */}
      <Link
        to="/play"
        className="block bg-forest text-white rounded-2xl p-5 text-center font-bold text-lg shadow-lg hover:bg-forest-light transition-colors"
        aria-label="Start playing"
      >
        Start Investigation!
      </Link>

      {/* Cryptids discovered */}
      {progress.discoveredCryptids.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-paper-dark">
          <h3 className="font-display font-bold text-forest mb-2">Field Guide</h3>
          <div className="flex gap-2 flex-wrap">
            {progress.discoveredCryptids.map((id) => {
              const c = cryptidRoster.find((cr) => cr.id === id);
              return c ? (
                <div key={id} className="w-12 h-12 bg-paper rounded-lg p-1 border border-paper-dark" title={c.name}>
                  <img src={c.svgSilhouette} alt={c.name} className="w-full h-full" />
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-paper-dark" aria-label={`${label}: ${value}`}>
      <img src={icon} alt="" className="w-6 h-6 mx-auto mb-1" />
      <div className="font-bold text-forest text-lg">{value}</div>
      <div className="text-xs text-bark-light">{label}</div>
    </div>
  );
}
