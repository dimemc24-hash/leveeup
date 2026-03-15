import { useEffect } from 'react';
import type { Cryptid } from '../../types';

interface CryptidRevealModalProps {
  cryptid: Cryptid | null;
  onClose: () => void;
}

export function CryptidRevealModal({ cryptid, onClose }: CryptidRevealModalProps) {
  useEffect(() => {
    if (!cryptid) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [cryptid, onClose]);

  if (!cryptid) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center animate-reveal-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={`${cryptid.name} reveal`}
      onClick={onClose}
      style={{ background: 'rgba(0,0,0,0.92)' }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-12 h-12 flex items-center justify-center text-white/80 hover:text-white text-3xl font-bold z-10 rounded-full transition-colors"
        style={{ background: 'rgba(255,255,255,0.1)' }}
        aria-label="Close"
      >
        ×
      </button>

      {/* Content */}
      <div
        className="flex flex-col items-center px-4 animate-reveal-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cryptid image */}
        <div
          className="rounded-2xl overflow-hidden mb-6"
          style={{
            boxShadow: '0 0 60px rgba(212,168,67,0.35), 0 0 120px rgba(212,168,67,0.15), inset 0 0 80px rgba(0,0,0,0.3)',
            maxWidth: '90vw',
            maxHeight: '70vh',
          }}
        >
          <img
            src={cryptid.revealImage}
            alt={cryptid.name}
            className="block object-contain"
            style={{
              maxWidth: '90vw',
              maxHeight: '70vh',
              filter: 'brightness(1.05) contrast(1.05)',
            }}
          />
        </div>

        {/* Name */}
        <h2
          className="font-display text-3xl sm:text-4xl font-bold text-center"
          style={{
            color: '#FFD700',
            textShadow: '0 0 20px rgba(255,215,0,0.5), 0 0 40px rgba(255,215,0,0.25)',
          }}
        >
          {cryptid.name}
        </h2>

        {/* Region / lore tagline */}
        <p
          className="text-sm mt-2 text-center"
          style={{ color: 'rgba(255,255,255,0.55)' }}
        >
          {cryptid.region} — {cryptid.lore.louisianaConnection
            ? cryptid.lore.louisianaConnection.split('.')[0] + '.'
            : cryptid.description.split('.')[0] + '.'}
        </p>
      </div>
    </div>
  );
}
