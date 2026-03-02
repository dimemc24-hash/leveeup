import type { ThemeConfig } from '../../../types';

// Template for creating new themes.
// Copy this file, rename, and fill in your theme's content.
export const templateTheme: ThemeConfig = {
  id: 'template',
  name: 'Template Theme',
  colors: {
    primary: '#000000',
    secondary: '#333333',
    accent: '#ff0000',
    background: '#ffffff',
    surface: '#f5f5f5',
    text: '#000000',
    textLight: '#666666',
    success: '#00aa00',
    error: '#cc0000',
    warning: '#ffaa00',
  },
  narrativeTemplates: {
    welcome: 'Welcome back!',
    session_start: 'Ready to learn?',
    correct_answer: 'Great job!',
    wrong_answer: 'Try again!',
    streak_3: 'Nice streak!',
    streak_5: 'Amazing streak!',
    streak_10: 'Incredible!',
    evidence_found: 'You found something!',
    frustration_pivot: "Let's try something different!",
    daily_login: 'Welcome back today!',
    subject_math: 'Time for math!',
    subject_ela: 'Time for reading!',
    subject_science: 'Time for science!',
    subject_social_studies: 'Time for social studies!',
  },
  milestoneMessages: {
    first_evidence: 'Your first milestone!',
  },
};
