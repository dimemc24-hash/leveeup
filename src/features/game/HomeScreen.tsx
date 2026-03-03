import { Link } from 'react-router-dom';
import { useGameStore } from '../../hooks/useGameStore';
import { useTheme } from '../themes/engine/ThemeContext';
import { cryptidRoster } from '../themes/cryptids/cryptidTheme';
import { Avatar } from '../avatar/Avatar';

export function HomeScreen() {
  const { profile, progress } = useGameStore();
  const { getNarrative } = useTheme();

  if (!profile) return null;

  const activeInv = progress.activeInvestigation;
  const invProgress = activeInv ? progress.investigationProgress[activeInv] : null;
  const activeCryptid = activeInv ? cryptidRoster.find((c) => c.id === activeInv) : null;

  const today = new Date().toISOString().slice(0, 10);
  const isNewDay = progress.lastPlayDate !== today;
  const allDiscovered = progress.discoveredCryptids.length === cryptidRoster.length;

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4 animate-slide-up">
      {/* Welcome + Avatar (front and center) */}
      <div className="journal-card bg-white/90 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <Link to="/avatar" aria-label="Customize avatar" className="flex-shrink-0 animate-float">
            <Avatar size={90} />
          </Link>
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-xl font-bold text-forest mb-1">
              Welcome back, {profile.name}!
            </h2>
            <p className="text-sm text-bark-light">{getNarrative('welcome')}</p>
          </div>
        </div>
      </div>

      {/* Daily login reward */}
      {isNewDay && (
        <div className="bg-gold/10 border-2 border-gold rounded-2xl p-4 text-center animate-bounce-in journal-card">
          <p className="font-bold text-gold-dark text-lg">Daily Field Supply!</p>
          <p className="text-sm text-bark-light mt-1">{getNarrative('daily_login')}</p>
        </div>
      )}

      {/* Daily streak (prominent, with fire animation) */}
      {progress.dailyStreak > 0 && (
        <div className="flex items-center justify-center gap-3 py-2">
          <span className="animate-fire text-3xl" aria-hidden="true">🔥</span>
          <div className="text-center">
            <div className="font-display font-bold text-2xl text-forest">{progress.dailyStreak}</div>
            <div className="text-xs text-bark-light font-bold uppercase tracking-wider">Day Streak</div>
          </div>
          <span className="animate-fire text-3xl" aria-hidden="true">🔥</span>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2" role="group" aria-label="Player statistics">
        <StatCard label="XP" value={progress.xp.toLocaleString()} icon="/assets/ui/xp-star.svg" />
        <StatCard label="Level" value={String(progress.level)} icon="/assets/ui/streak-fire.svg" />
        <StatCard label="Evidence" value={String(progress.evidencePieces)} icon="/assets/ui/evidence-magnifier.svg" />
      </div>

      {/* Current investigation (prominent) */}
      {activeCryptid && invProgress && !invProgress.completed && (
        <div className="journal-card bg-white/90 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-14 h-14 bg-paper rounded-xl p-1.5 flex items-center justify-center flex-shrink-0">
              <img src={activeCryptid.svgSilhouette} alt="" className="w-full h-full opacity-60" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-bold text-forest text-lg">Investigating: {activeCryptid.name}</h3>
              <p className="text-xs text-bark-light">{activeCryptid.region}</p>
            </div>
          </div>
          {/* Evidence progress */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-bark-light mb-1">
              <span>Evidence</span>
              <span className="font-bold">{invProgress.evidenceCollected} / {activeCryptid.evidenceRequired}</span>
            </div>
            <div
              className="w-full bg-paper-dark rounded-full h-3 overflow-hidden"
              role="progressbar"
              aria-valuenow={invProgress.evidenceCollected}
              aria-valuemax={activeCryptid.evidenceRequired}
              aria-label="Evidence progress"
            >
              <div
                className="bg-gold h-full rounded-full transition-all duration-700 animate-progress"
                style={{ width: `${(invProgress.evidenceCollected / activeCryptid.evidenceRequired) * 100}%` }}
              />
            </div>
          </div>
          {/* Clue dots */}
          <div className="flex gap-2 mb-2 justify-center" aria-label={`${invProgress.cluesFound} of ${invProgress.totalClues} clues found`}>
            {Array.from({ length: invProgress.totalClues }).map((_, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  i < invProgress.cluesFound
                    ? 'bg-forest-light text-white animate-bounce-in'
                    : 'bg-paper-dark text-bark-light'
                }`}
                style={i < invProgress.cluesFound ? { animationDelay: `${i * 100}ms` } : undefined}
                aria-hidden="true"
              >
                {i < invProgress.cluesFound ? '✓' : '?'}
              </div>
            ))}
          </div>
          <p className="text-xs text-bark-light mt-1 text-center">
            {invProgress.cluesFound} / {invProgress.totalClues} clues found
          </p>
        </div>
      )}

      {/* All cryptids discovered celebration */}
      {allDiscovered && (
        <div className="journal-card bg-gold/10 border-2 border-gold rounded-2xl p-5 shadow-sm text-center">
          <div className="text-4xl mb-2">🏆</div>
          <h3 className="font-display text-xl font-bold text-gold">Master Investigator!</h3>
          <p className="text-xs text-bark-light mt-1">All {cryptidRoster.length} cryptids discovered!</p>
        </div>
      )}

      {/* Quick play CTA */}
      <Link
        to="/play"
        className="block bg-forest text-white rounded-2xl p-5 text-center font-bold text-xl shadow-lg hover:bg-forest-light transition-all hover:scale-[1.02] active:scale-[0.98] min-h-[56px] flex items-center justify-center"
        aria-label="Start an investigation mission"
      >
        Start Investigation!
      </Link>

      {/* Cryptids discovered */}
      {progress.discoveredCryptids.length > 0 && (
        <div className="journal-card bg-white/90 rounded-2xl p-4 shadow-sm">
          <h3 className="font-display font-bold text-forest mb-3">Field Guide</h3>
          <div className="flex gap-3 flex-wrap">
            {progress.discoveredCryptids.map((id) => {
              const c = cryptidRoster.find((cr) => cr.id === id);
              return c ? (
                <div
                  key={id}
                  className="w-14 h-14 bg-paper rounded-xl p-1.5 border-2 border-gold/40 hover:border-gold transition-colors"
                  title={c.name}
                >
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
    <div
      className="journal-card bg-white/90 rounded-xl p-3 text-center shadow-sm"
      aria-label={`${label}: ${value}`}
    >
      <img src={icon} alt="" className="w-7 h-7 mx-auto mb-1" aria-hidden="true" />
      <div className="font-bold text-forest text-xl animate-count-up">{value}</div>
      <div className="text-xs text-bark-light font-bold">{label}</div>
    </div>
  );
}
