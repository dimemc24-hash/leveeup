import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useGameStore } from '../hooks/useGameStore';

export function Layout({ children }: { children: ReactNode }) {
  const { profile, progress, logout } = useGameStore();
  const location = useLocation();

  if (!profile) return <>{children}</>;

  const nav = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/play', label: 'Play', icon: '🎯' },
    { path: '/spell', label: 'Spell', icon: '✏️' },
    { path: '/field-guide', label: 'Math', icon: '📓' },
    { path: '/clues', label: 'Clues', icon: '🔍' },
    { path: '/shop', label: 'Shop', icon: '🏪' },
    { path: '/avatar', label: 'Avatar', icon: '🧑' },
  ];

  if (profile.role === 'PARENT' || profile.role === 'TEACHER') {
    nav.push({ path: '/dashboard', label: 'Data', icon: '📊' });
  }

  return (
    <div className="min-h-screen flex flex-col paper-texture">
      {/* Skip link for a11y */}
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      {/* Top bar */}
      <header className="bg-forest text-white px-4 py-2.5 flex items-center justify-between shadow-md" role="banner">
        <Link to="/" className="font-display text-lg font-bold tracking-wide" aria-label="Go to home page">
          LeveeUp
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1.5" aria-label={`${progress.xp} XP available`}>
            <img src="/assets/ui/xp-star.svg" alt="" className="w-5 h-5" />
            <span className="font-bold">{progress.xp}</span>
          </span>
          {progress.dailyStreak > 0 && (
            <span className="flex items-center gap-1" aria-label={`${progress.dailyStreak} day streak`}>
              <span className="animate-fire text-base">🔥</span>
              <span className="font-bold">{progress.dailyStreak}</span>
            </span>
          )}
          <span className="bg-forest-light px-2.5 py-0.5 rounded-full text-xs font-bold" aria-label={`Level ${progress.level}`}>
            Lv.{progress.level}
          </span>
          <button
            onClick={logout}
            className="text-white/70 hover:text-white text-xs ml-1 transition-colors"
            aria-label="Log out"
          >
            ✕
          </button>
        </div>
      </header>

      {/* Main content */}
      <main id="main-content" className="flex-1 overflow-y-auto pb-24 animate-page-enter" role="main">
        {children}
      </main>

      {/* Bottom nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t-2 border-paper-dark flex justify-around py-1.5 px-2 shadow-[0_-2px_12px_rgba(0,0,0,0.08)] z-50"
        aria-label="Main navigation"
        role="navigation"
      >
        {nav.map(({ path, label, icon }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all min-w-[52px] min-h-[48px] justify-center ${
                active
                  ? 'text-forest font-bold bg-forest/8 scale-105'
                  : 'text-bark-light hover:text-bark hover:bg-paper/50'
              }`}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
            >
              <span className={`text-xl transition-transform ${active ? 'scale-110' : ''}`} aria-hidden="true">
                {icon}
              </span>
              <span className="text-[11px] leading-none">{label}</span>
              {active && (
                <span className="absolute -bottom-0.5 w-6 h-0.5 bg-forest rounded-full" aria-hidden="true" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
