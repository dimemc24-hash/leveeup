import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useGameStore } from '../hooks/useGameStore';

export function Layout({ children }: { children: ReactNode }) {
  const { profile, progress } = useGameStore();
  const location = useLocation();

  if (!profile) return <>{children}</>;

  const nav = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/play', label: 'Play', icon: '🎯' },
    { path: '/clues', label: 'Clues', icon: '🔍' },
    { path: '/shop', label: 'Shop', icon: '🏪' },
    { path: '/avatar', label: 'Avatar', icon: '🧑' },
  ];

  if (profile.role === 'PARENT' || profile.role === 'TEACHER') {
    nav.push({ path: '/dashboard', label: 'Dashboard', icon: '📊' });
  }

  return (
    <div className="min-h-screen flex flex-col paper-texture">
      {/* Top bar */}
      <header className="bg-forest text-white px-4 py-2 flex items-center justify-between shadow-md">
        <Link to="/" className="font-display text-lg font-bold tracking-wide" aria-label="Go to home page">
          LeveeUp
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <span className="flex items-center gap-1" aria-label={`${progress.xp} XP available`}>
            <img src="/assets/ui/xp-star.svg" alt="" className="w-4 h-4" />
            {progress.xp}
          </span>
          <span className="flex items-center gap-1" aria-label={`Streak: ${progress.streak}`}>
            <img src="/assets/ui/streak-fire.svg" alt="" className="w-4 h-4" />
            {progress.streak}
          </span>
          <span className="bg-forest-light px-2 py-0.5 rounded-full text-xs font-bold">
            Lv.{progress.level}
          </span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-paper-dark flex justify-around py-2 shadow-[0_-2px_8px_rgba(0,0,0,0.1)] z-50" aria-label="Main navigation">
        {nav.map(({ path, label, icon }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center gap-0.5 text-xs transition-colors ${active ? 'text-forest font-bold' : 'text-bark-light'}`}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
            >
              <span className="text-lg">{icon}</span>
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
