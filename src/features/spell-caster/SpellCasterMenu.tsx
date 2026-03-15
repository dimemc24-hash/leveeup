import { Link } from 'react-router-dom';
import { wordPacks } from '../../data/spellCasterWords';
import type { WordPack } from '../../data/spellCasterWords';

export function SpellCasterMenu() {
  return (
    <div className="spell-caster spell-caster-page p-4 max-w-lg mx-auto space-y-6">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold text-spell-cream mb-1">Cryptid Whispers</h1>
        <p className="text-spell-muted text-sm">A cryptid calls from the shadows... can you write what it says?</p>
      </div>

      <div className="space-y-3">
        {wordPacks.map((pack: WordPack) => (
          <Link
            key={pack.id}
            to={`/spell/play/${pack.id}`}
            className="block w-full rounded-2xl p-5 text-left border-2 border-spell-border bg-spell-card hover:bg-spell-card-hover hover:border-spell-accent transition-all shadow-lg"
            aria-label={`Play ${pack.name}, ${pack.words.length} words`}
          >
            <div className="font-display font-bold text-spell-cream text-lg">{pack.name}</div>
            <div className="text-spell-muted text-sm mt-1">{pack.words.length} words</div>
          </Link>
        ))}
      </div>

      <p className="text-spell-muted text-xs text-center">
        Use a stylus or your finger to write. Tap &quot;Hear again&quot; if you need the word repeated.
      </p>
    </div>
  );
}
