import { createContext, useContext, useState, type ReactNode } from 'react';
import type { ThemeConfig } from '../../../types';
import { cryptidTheme } from '../cryptids/cryptidTheme';

interface ThemeContextValue {
  theme: ThemeConfig;
  setTheme: (theme: ThemeConfig) => void;
  getNarrative: (key: string, fallback?: string) => string;
  getMilestoneMessage: (key: string) => string;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeConfig>(cryptidTheme);

  const getNarrative = (key: string, fallback = '') =>
    theme.narrativeTemplates[key] ?? fallback;

  const getMilestoneMessage = (key: string) =>
    theme.milestoneMessages[key] ?? 'Great job, investigator!';

  return (
    <ThemeContext.Provider value={{ theme, setTheme, getNarrative, getMilestoneMessage }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
