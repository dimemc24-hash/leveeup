import { useEffect } from 'react';

interface XPToastProps {
  xp: number;
  onDone?: () => void;
}

export function XPToast({ xp, onDone }: XPToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => onDone?.(), 1200);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="fixed top-1/3 left-1/2 -translate-x-1/2 z-[9998] pointer-events-none">
      <div
        className="font-display text-3xl font-bold text-gold"
        style={{
          animation: 'xp-rise 1.2s ease-out forwards',
          textShadow: '0 2px 8px rgba(255,184,0,0.5)',
        }}
      >
        +{xp} XP
      </div>
    </div>
  );
}
