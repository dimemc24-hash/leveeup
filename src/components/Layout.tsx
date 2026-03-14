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
      <header
        className="px-4 py-2.5 flex items-center justify-between shadow-lg relative z-10"
        style={{ background: 'linear-gradient(135deg, #0a2a1a 0%, #0d3d2a 50%, #0a2a1a 100%)' }}
        role="banner"
      >
        <Link to="/" className="font-display text-xl font-bold tracking-wide text-white" style={{ textShadow: '0 0 20px rgba(0,200,150,0.4)' }} aria-label="Go to home page">
          LeveeUp
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <span
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(0,200,150,0.15)', border: '1px solid rgba(0,200,150,0.25)' }}
            aria-label={`${progress.xp} XP available`}
          >
            <img src="/assets/ui/xp-star.svg" alt="" className="w-5 h-5" />
            <span className="font-bold text-forest">{progress.xp}</span>
          </span>
          {progress.dailyStreak > 0 && (
            <span
              className="flex items-center gap-1 px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(255,184,0,0.15)', border: '1px solid rgba(255,184,0,0.25)' }}
              aria-label={`${progress.dailyStreak} day streak`}
            >
              <span className="animate-fire text-base">🔥</span>
              <span className="font-bold text-gold">{progress.dailyStreak}</span>
            </span>
          )}
          <span
            className="px-3 py-1 rounded-full text-xs font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #00c896, #00a67a)', boxShadow: '0 0 12px rgba(0,200,150,0.3)' }}
            aria-label={`Level ${progress.level}`}
          >
            Lv.{progress.level}
          </span>
          <button
            onClick={logout}
            className="text-white/50 hover:text-white text-xs ml-1 transition-colors"
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
        className="fixed bottom-0 left-0 right-0 flex justify-around py-1.5 px-2 z-50"
        style={{
          background: 'rgba(10, 20, 35, 0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(0, 200, 150, 0.15)',
          boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.4)',
        }}
        aria-label="Main navigation"
        role="navigation"
      >
        {nav.map(({ path, label, icon }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-all duration-200 min-w-[52px] min-h-[48px] justify-center relative ${
                active
                  ? 'text-forest font-bold'
                  : 'text-bark-light/60 hover:text-bark-light'
              }`}
              style={active ? {
                background: 'rgba(0, 200, 150, 0.12)',
                boxShadow: '0 0 16px rgba(0, 200, 150, 0.15)',
              } : undefined}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
            >
              {active && (
                <span className="absolute -top-1 w-5 h-1 rounded-full bg-forest" style={{ boxShadow: '0 0 8px rgba(0,200,150,0.5)' }} aria-hidden="true" />
              )}
              <span className={`text-xl transition-all duration-200 ${active ? 'scale-115' : ''}`} aria-hidden="true">
                {icon}
              </span>
              <span className={`text-[10px] leading-none ${active ? 'text-forest font-bold' : ''}`}>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
