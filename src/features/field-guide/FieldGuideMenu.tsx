import { Link } from 'react-router-dom';
import { mathProblemPacks } from '../../data/mathFieldGuide';

export function FieldGuideMenu() {
  return (
    <div className="spell-caster spell-caster-page p-4 max-w-lg mx-auto space-y-6">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold text-spell-cream mb-1">Field Guide — Math</h1>
        <p className="text-spell-muted text-sm">Solve & document. Show your work to catch the cryptid!</p>
      </div>

      <div className="space-y-3">
        {mathProblemPacks.map((pack) => (
          <Link
            key={pack.id}
            to={`/field-guide/play/${pack.id}`}
            className="block w-full rounded-2xl p-5 text-left border-2 border-spell-border bg-spell-card hover:bg-spell-card-hover hover:border-spell-accent transition-all shadow-lg"
            aria-label={`Play ${pack.name}, ${pack.problems.length} problems`}
          >
            <div className="font-display font-bold text-spell-cream text-lg">{pack.name}</div>
            <div className="text-spell-muted text-sm mt-1">{pack.problems.length} problems</div>
          </Link>
        ))}
      </div>

      <p className="text-spell-muted text-xs text-center">
        Each problem has steps. Complete them all to get the full cryptid reveal — skip steps and it escapes!
      </p>
    </div>
  );
}
