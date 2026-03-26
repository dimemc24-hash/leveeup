import { ReactNode } from 'react';

interface StreakFireProps {
  streak: number;
  children: ReactNode;
}

export function StreakFire({ streak, children }: StreakFireProps) {
  if (streak < 3) return <>{children}</>;

  const particleCount = Math.min(streak, 12);
  const particles = Array.from({ length: particleCount }, (_, i) => ({
    id: i,
    x: -8 + Math.random() * 16,
    delay: Math.random() * 0.5,
    size: 3 + Math.random() * 4,
  }));

  return (
    <span className="relative inline-flex items-center">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `calc(50% + ${p.x}px)`,
            bottom: '100%',
            background: `radial-gradient(circle, #FFB800, #ef4444)`,
            animation: `streak-particle 0.8s ease-out ${p.delay}s infinite`,
            opacity: 0.7,
          }}
        />
      ))}
      {children}
    </span>
  );
}
