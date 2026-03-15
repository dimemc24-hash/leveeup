import { useEffect } from 'react';
import type { Cryptid } from '../../types';

interface CryptidRevealModalProps {
  cryptid: Cryptid | null;
  onClose: () => void;
}

export function CryptidRevealModal({ cryptid, onClose }: CryptidRevealModalProps) {
  useEffect(() => {
    if (!cryptid) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [cryptid, onClose]);

  if (!cryptid) return null;

  const dangerLabel = ['', 'Low', 'Low', 'Medium', 'High', 'High'][cryptid.cardStats.danger] ?? 'Unknown';
  const stealthLabel = ['', 'Visible', 'Shy', 'Elusive', 'Stealthy', 'Invisible'][cryptid.cardStats.stealth] ?? 'Unknown';
  const mysteryLabel = ['', 'Common', 'Curious', 'Strange', 'Eerie', 'Legendary'][cryptid.cardStats.mystery] ?? 'Unknown';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-reveal-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={`${cryptid.name} dossier`}
      onClick={onClose}
      style={{ background: 'rgba(0,0,0,0.93)' }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-12 h-12 flex items-center justify-center text-white/70 hover:text-white text-2xl font-bold z-20 rounded-full transition-colors"
        style={{ background: 'rgba(255,255,255,0.12)' }}
        aria-label="Close"
      >
        ✕
      </button>

      {/* Scrollable dossier panel */}
      <div
        className="relative w-full sm:max-w-lg mx-auto rounded-t-3xl sm:rounded-3xl overflow-hidden animate-reveal-scale-in"
        style={{
          background: 'linear-gradient(180deg, #0d1f0d 0%, #0a1a12 100%)',
          border: '1px solid rgba(212,168,67,0.3)',
          boxShadow: '0 0 60px rgba(212,168,67,0.2), 0 -4px 40px rgba(0,0,0,0.6)',
          maxHeight: '92vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Scrollable content */}
        <div className="overflow-y-auto" style={{ maxHeight: '92vh' }}>

          {/* Hero image */}
          <div className="relative w-full" style={{ height: '42vw', maxHeight: '240px', minHeight: '160px' }}>
            <img
              src={cryptid.revealImage}
              alt={cryptid.name}
              className="w-full h-full object-cover"
              style={{ filter: 'brightness(0.85) contrast(1.1)' }}
            />
            {/* Gradient overlay so name sits cleanly on image */}
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(13,31,13,0.95) 100%)' }}
            />
            {/* Captured badge */}
            <div
              className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest"
              style={{ background: 'rgba(212,168,67,0.2)', border: '1px solid rgba(212,168,67,0.6)', color: '#FFD700' }}
            >
              ✓ CAPTURED
            </div>
          </div>

          {/* Name + region */}
          <div className="px-5 pt-3 pb-2">
            <h2
              className="font-display text-2xl sm:text-3xl font-bold leading-tight"
              style={{ color: '#FFD700', textShadow: '0 0 16px rgba(255,215,0,0.4)' }}
            >
              {cryptid.name}
            </h2>
            <p className="text-xs mt-1 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.45)' }}>
              📍 {cryptid.region}
            </p>
          </div>

          {/* Stat pills */}
          <div className="px-5 pb-4 flex gap-2 flex-wrap">
            <StatPill label="Danger" value={dangerLabel} color="#ef4444" />
            <StatPill label="Stealth" value={stealthLabel} color="#8b5cf6" />
            <StatPill label="Mystery" value={mysteryLabel} color="#3b82f6" />
          </div>

          <Divider />

          {/* Description */}
          <Section title="🔍 Field Description">
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>
              {cryptid.description}
            </p>
          </Section>

          <Divider />

          {/* Origin story — first 2 sentences to keep it kid-length */}
          <Section title="📖 The Legend">
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>
              {cryptid.lore.originStory.split('.').slice(0, 3).join('.') + '.'}
            </p>
          </Section>

          <Divider />

          {/* Fun facts */}
          <Section title="⚡ Investigator Notes">
            <ul className="space-y-2">
              {cryptid.lore.funFacts.map((fact, i) => (
                <li key={i} className="flex gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
                  <span style={{ color: '#FFD700', flexShrink: 0 }}>▸</span>
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Divider />

          {/* Field notes */}
          <Section title="🗒️ Field Report">
            <p
              className="text-sm leading-relaxed italic"
              style={{ color: 'rgba(255,220,100,0.75)', borderLeft: '2px solid rgba(212,168,67,0.4)', paddingLeft: '12px' }}
            >
              {cryptid.lore.fieldNotes}
            </p>
          </Section>

          {/* Louisiana connection if present */}
          {cryptid.lore.louisianaConnection && (
            <>
              <Divider />
              <Section title="🌿 Louisiana Connection">
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
                  {cryptid.lore.louisianaConnection}
                </p>
              </Section>
            </>
          )}

          {/* Close button at bottom for mobile */}
          <div className="px-5 py-5">
            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl font-bold text-base transition-all active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #d4a843, #b8922e)',
                color: '#0d1f0d',
                boxShadow: '0 4px 0 #7a5a10',
              }}
            >
              Close Dossier
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-5 py-3">
      <h3 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(212,168,67,0.8)' }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function Divider() {
  return <div className="mx-5" style={{ height: '1px', background: 'rgba(212,168,67,0.15)' }} />;
}

function StatPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
      style={{ background: `${color}18`, border: `1px solid ${color}40`, color }}
    >
      <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>{label}:</span>
      <span>{value}</span>
    </div>
  );
}
