import { useState, useEffect } from 'react';
import { useGameStore } from '../../hooks/useGameStore';
import type { UserRole } from '../../types';

export function LoginScreen() {
  const { profiles, loadProfiles, setProfile, createProfile } = useGameStore();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('STUDENT');

  useEffect(() => { loadProfiles(); }, [loadProfiles]);

  const handleCreate = () => {
    if (name.trim().length < 1) return;
    createProfile(name.trim(), role);
    setShowCreate(false);
    setName('');
  };

  return (
    <div className="min-h-screen paper-texture flex flex-col items-center justify-center p-6">
      <div className="max-w-sm w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold text-forest mb-2">LeveeUp</h1>
          <p className="text-bark-light text-sm">Junior Cryptid Investigator Program</p>
          <div className="mt-4 w-24 h-24 mx-auto">
            <img src="/assets/ui/evidence-magnifier.svg" alt="Magnifying glass" className="w-full h-full" />
          </div>
        </div>

        {/* Profile selection */}
        {!showCreate && (
          <div className="space-y-3">
            {profiles.length > 0 && (
              <>
                <p className="text-sm font-bold text-bark mb-2">Select your profile:</p>
                {profiles.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setProfile(p)}
                    className="w-full bg-white border-2 border-forest/20 rounded-xl p-4 text-left hover:border-forest hover:shadow-md transition-all flex items-center gap-3"
                    aria-label={`Sign in as ${p.name}`}
                  >
                    <div className="w-10 h-10 rounded-full bg-forest/10 flex items-center justify-center text-xl font-bold text-forest">
                      {p.name[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-bark">{p.name}</div>
                      <div className="text-xs text-bark-light capitalize">{p.role.toLowerCase()}</div>
                    </div>
                  </button>
                ))}
                <div className="text-center text-bark-light text-xs my-2">or</div>
              </>
            )}
            <button
              onClick={() => setShowCreate(true)}
              className="w-full bg-forest text-white rounded-xl p-4 font-bold hover:bg-forest-light transition-colors shadow-md"
              aria-label="Create a new profile"
            >
              + New Investigator
            </button>
          </div>
        )}

        {/* Create profile form */}
        {showCreate && (
          <div className="bg-white rounded-xl p-6 shadow-lg border border-paper-dark">
            <h2 className="font-display text-xl font-bold text-forest mb-4">New Investigator</h2>
            <label className="block mb-3">
              <span className="text-sm font-bold text-bark">Name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-lg border-2 border-paper-dark p-3 text-bark focus:border-forest focus:outline-none"
                placeholder="Enter your name"
                maxLength={20}
                aria-label="Your name"
                autoFocus
              />
            </label>
            <label className="block mb-4">
              <span className="text-sm font-bold text-bark">I am a...</span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="mt-1 block w-full rounded-lg border-2 border-paper-dark p-3 text-bark focus:border-forest focus:outline-none"
                aria-label="Select your role"
              >
                <option value="STUDENT">Student</option>
                <option value="PARENT">Parent</option>
                <option value="TEACHER">Teacher</option>
              </select>
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 border-2 border-bark/20 rounded-xl p-3 text-bark hover:bg-paper-dark transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleCreate}
                disabled={name.trim().length < 1}
                className="flex-1 bg-forest text-white rounded-xl p-3 font-bold hover:bg-forest-light transition-colors disabled:opacity-50"
              >
                Start!
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
