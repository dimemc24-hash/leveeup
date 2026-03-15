import { useState, useEffect } from 'react';
import { useGameStore } from '../../hooks/useGameStore';
import { supabase } from '../../lib/supabase';
import { storage } from '../../lib/storage';
import type { UserRole } from '../../types';

type AuthMode = 'login' | 'signup';
type Screen = 'auth' | 'profiles' | 'create-student';

export function LoginScreen() {
  const { profiles, loadProfiles, setProfile, createProfile } = useGameStore();

  // Auth state
  const [screen, setScreen] = useState<Screen>('auth');
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('PARENT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);

  // Student creation
  const [studentName, setStudentName] = useState('');

  // Check for existing session on mount
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const ok = await storage.initializeFromSupabase();
        if (ok) {
          loadProfiles();
          setScreen('profiles');
        }
      }
      setCheckingSession(false);
    });
  }, [loadProfiles]);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    const ok = await storage.initializeFromSupabase();
    if (ok) {
      loadProfiles();
      setScreen('profiles');
    } else {
      setError('Failed to load profile data. Please try again.');
    }
    setLoading(false);
  };

  const handleSignup = async () => {
    if (!name.trim()) { setError('Please enter your name.'); return; }
    setLoading(true);
    setError('');

    const { error: err, data } = await supabase.auth.signUp({ email, password });
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    if (!data.user) {
      setError('Signup succeeded but no user returned.');
      setLoading(false);
      return;
    }

    // Create the users record
    const { error: insertErr } = await supabase.from('users').insert({
      id: data.user.id,
      email,
      role: role.toLowerCase(),
      display_name: name.trim(),
    });

    if (insertErr) {
      setError(insertErr.message);
      setLoading(false);
      return;
    }

    // If signing up as STUDENT, auto-create a student profile
    if (role === 'STUDENT') {
      const studentId = crypto.randomUUID();
      await supabase.from('students').insert({
        id: studentId,
        user_id: data.user.id,
        display_name: name.trim(),
      });
    }

    const ok = await storage.initializeFromSupabase();
    if (ok) {
      loadProfiles();
      setScreen('profiles');
    }
    setLoading(false);
  };

  const handleCreateStudent = async () => {
    if (!studentName.trim()) return;
    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError('Not authenticated.'); setLoading(false); return; }

      const studentId = crypto.randomUUID();
      const { error: insertErr } = await supabase.from('students').insert({
        id: studentId,
        user_id: user.id,
        parent_id: user.id,
        display_name: studentName.trim(),
      });

      if (insertErr) {
        setError(`Could not create profile: ${insertErr.message}`);
        setLoading(false);
        return;
      }

      // Re-initialize from Supabase to pick up the new student
      await storage.initializeFromSupabase();
      loadProfiles();
      setStudentName('');
      setScreen('profiles');
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    storage.resetCache();
    useGameStore.getState().logout();
    setScreen('auth');
    setEmail('');
    setPassword('');
    setName('');
    setError('');
  };

  // Loading check
  if (checkingSession) {
    return (
      <div className="min-h-screen paper-texture flex items-center justify-center" role="status" aria-label="Loading">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-forest/20 border-t-forest rounded-full animate-spin" />
          <p className="text-bark-light font-display">Loading field notes...</p>
        </div>
      </div>
    );
  }

  // ─── Profile selection screen ───
  if (screen === 'profiles') {
    const studentProfiles = profiles.filter((p) => p.role === 'STUDENT');
    const userProfile = profiles.find((p) => p.role === 'PARENT' || p.role === 'TEACHER');

    return (
      <div className="min-h-screen paper-texture flex flex-col items-center justify-center p-6">
        <div className="max-w-sm w-full space-y-4">
          <div className="text-center mb-6">
            <h1 className="font-display text-4xl font-bold text-forest mb-2">LeveeUp</h1>
            <p className="text-bark-light text-sm">Junior Cryptid Investigator Program</p>
            {userProfile && (
              <p className="text-xs text-bark-light mt-2">
                Signed in as <span className="font-bold text-bark">{userProfile.name}</span>
              </p>
            )}
          </div>

          {studentProfiles.length > 0 && (
            <>
              <p className="text-sm font-bold text-bark">Select an investigator:</p>
              <div className="space-y-3">
                {studentProfiles.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setProfile(p)}
                    className="w-full bg-white/80 border-2 border-forest/20 rounded-xl p-4 text-left hover:border-forest hover:shadow-md transition-all flex items-center gap-3 min-h-[56px]"
                    aria-label={`Play as ${p.name}`}
                  >
                    <div className="w-11 h-11 rounded-full bg-forest/10 flex items-center justify-center text-xl font-bold text-forest flex-shrink-0">
                      {p.name[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-bark text-lg">{p.name}</div>
                      <div className="text-xs text-bark-light">Student Investigator</div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Dashboard access for parent / teacher */}
          {userProfile && (
            <button
              onClick={() => setProfile(userProfile)}
              className="w-full bg-forest/5 border-2 border-forest/20 rounded-xl p-4 text-left hover:border-forest hover:shadow-md transition-all flex items-center gap-3 min-h-[56px]"
              aria-label={`Open ${userProfile.role.toLowerCase()} dashboard`}
            >
              <div className="w-11 h-11 rounded-full bg-gold/20 flex items-center justify-center text-xl flex-shrink-0">
                {userProfile.role === 'TEACHER' ? '📊' : '👨‍👩‍👧'}
              </div>
              <div>
                <div className="font-bold text-bark text-lg">{userProfile.role === 'TEACHER' ? 'Teacher' : 'Parent'} Dashboard</div>
                <div className="text-xs text-bark-light">View student progress</div>
              </div>
            </button>
          )}

          <div className="text-center text-bark-light text-xs my-2">or</div>

          <button
            onClick={() => setScreen('create-student')}
            className="w-full bg-forest text-white rounded-xl p-4 font-bold hover:bg-forest-light transition-colors shadow-md min-h-[56px] text-lg"
            aria-label="Add a new student profile"
          >
            + New Investigator
          </button>

          <button
            onClick={handleLogout}
            className="w-full text-bark-light text-sm hover:text-bark transition-colors p-2"
            aria-label="Sign out"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  // ─── Create student screen ───
  if (screen === 'create-student') {
    return (
      <div className="min-h-screen paper-texture flex flex-col items-center justify-center p-6">
        <div className="max-w-sm w-full">
          <div className="bg-white/90 rounded-2xl p-6 shadow-lg border border-paper-dark journal-card">
            <h2 className="font-display text-2xl font-bold text-forest mb-4">New Investigator</h2>
            <label className="block mb-4">
              <span className="text-sm font-bold text-bark">Investigator Name</span>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="mt-1 block w-full rounded-lg border-2 border-paper-dark p-3 text-bark text-lg focus:border-forest focus:outline-none"
                placeholder="Enter name"
                maxLength={20}
                aria-label="Student name"
                autoFocus
              />
            </label>
            {error && (
              <div className="bg-danger/10 border border-danger/30 rounded-lg p-3 text-sm text-danger mb-3" role="alert">
                {error}
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setScreen('profiles')}
                className="flex-1 border-2 border-bark/20 rounded-xl p-3 text-bark hover:bg-paper-dark transition-colors min-h-[48px]"
                aria-label="Go back"
              >
                Back
              </button>
              <button
                onClick={handleCreateStudent}
                disabled={!studentName.trim() || loading}
                className="flex-1 bg-forest text-white rounded-xl p-3 font-bold hover:bg-forest-light transition-colors disabled:opacity-50 min-h-[48px]"
                aria-label="Create investigator profile"
              >
                {loading ? 'Creating...' : 'Start!'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Auth screen (login / signup) ───
  return (
    <div className="min-h-screen paper-texture flex flex-col items-center justify-center p-6">
      <div className="max-w-sm w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold text-forest mb-2">LeveeUp</h1>
          <p className="text-bark-light text-sm">Junior Cryptid Investigator Program</p>
          <div className="mt-4 w-24 h-24 mx-auto">
            <img src="/assets/ui/evidence-magnifier.svg" alt="" className="w-full h-full" />
          </div>
        </div>

        {/* Auth mode tabs */}
        <div className="flex mb-4 rounded-xl overflow-hidden border-2 border-paper-dark" role="tablist" aria-label="Authentication mode">
          <button
            onClick={() => { setAuthMode('login'); setError(''); }}
            className={`flex-1 py-3 font-bold text-sm transition-colors min-h-[48px] ${
              authMode === 'login' ? 'bg-forest text-white' : 'bg-white text-bark-light hover:bg-paper'
            }`}
            role="tab"
            aria-selected={authMode === 'login'}
          >
            Sign In
          </button>
          <button
            onClick={() => { setAuthMode('signup'); setError(''); }}
            className={`flex-1 py-3 font-bold text-sm transition-colors min-h-[48px] ${
              authMode === 'signup' ? 'bg-forest text-white' : 'bg-white text-bark-light hover:bg-paper'
            }`}
            role="tab"
            aria-selected={authMode === 'signup'}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <div className="bg-white/90 rounded-2xl p-6 shadow-lg border border-paper-dark journal-card space-y-4">
          {authMode === 'signup' && (
            <label className="block">
              <span className="text-sm font-bold text-bark">Your Name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-lg border-2 border-paper-dark p-3 text-bark text-lg focus:border-forest focus:outline-none"
                placeholder="Enter your name"
                maxLength={40}
                aria-label="Your name"
              />
            </label>
          )}

          <label className="block">
            <span className="text-sm font-bold text-bark">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-lg border-2 border-paper-dark p-3 text-bark text-lg focus:border-forest focus:outline-none"
              placeholder="you@example.com"
              aria-label="Email address"
              autoComplete="email"
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-bark">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-lg border-2 border-paper-dark p-3 text-bark text-lg focus:border-forest focus:outline-none"
              placeholder="••••••••"
              aria-label="Password"
              autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
            />
          </label>

          {authMode === 'signup' && (
            <label className="block">
              <span className="text-sm font-bold text-bark">I am a...</span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="mt-1 block w-full rounded-lg border-2 border-paper-dark p-3 text-bark text-lg focus:border-forest focus:outline-none"
                aria-label="Select your role"
              >
                <option value="PARENT">Parent</option>
                <option value="TEACHER">Teacher</option>
                <option value="STUDENT">Student</option>
              </select>
            </label>
          )}

          {error && (
            <div className="bg-danger/10 border border-danger/30 rounded-lg p-3 text-sm text-danger" role="alert">
              {error}
            </div>
          )}

          <button
            onClick={authMode === 'login' ? handleLogin : handleSignup}
            disabled={loading || !email || !password}
            className="w-full bg-forest text-white rounded-xl p-4 font-bold text-lg hover:bg-forest-light transition-colors disabled:opacity-50 shadow-md min-h-[56px]"
            aria-label={authMode === 'login' ? 'Sign in' : 'Create account'}
          >
            {loading
              ? 'Please wait...'
              : authMode === 'login'
              ? 'Sign In'
              : 'Create Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
