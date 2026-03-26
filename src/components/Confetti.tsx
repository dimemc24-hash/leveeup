import { useEffect, useState } from 'react';

interface ConfettiProps {
  onComplete?: () => void;
}

const COLORS = ['#FFB800', '#00c896', '#ef4444', '#60a5fa', '#f472b6', '#a78bfa'];

interface Particle {
  id: number;
  x: number;
  color: string;
  size: number;
  delay: number;
  drift: number;
  rotation: number;
}

export function Confetti({ onComplete }: ConfettiProps) {
  const [particles] = useState<Particle[]>(() =>
    Array.from({ length: 35 }, (_, i) => ({
      id: i,
      x: 10 + Math.random() * 80,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 6 + Math.random() * 6,
      delay: Math.random() * 0.4,
      drift: -60 + Math.random() * 120,
      rotation: Math.random() * 360,
    }))
  );

  useEffect(() => {
    const timer = setTimeout(() => onComplete?.(), 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: '40%',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.id % 3 === 0 ? '50%' : '2px',
            animation: `confetti-fall 1.8s ease-out ${p.delay}s forwards`,
            '--confetti-drift': `${p.drift}px`,
            transform: `rotate(${p.rotation}deg)`,
            opacity: 0,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
