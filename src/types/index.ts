// ─── User & Auth ───
export type UserRole = 'STUDENT' | 'PARENT' | 'TEACHER';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  equippedItems: string[];
  createdAt: number;
}

// ─── Subjects & Standards ───
export type Subject = 'math' | 'ela' | 'science' | 'social_studies';

export type Tier = 'introductory' | 'developing' | 'mastery';

export type QuestionType = 'multiple_choice' | 'fill_in' | 'sequencing' | 'drag_and_drop';

export interface Question {
  id: string;
  subject: Subject;
  standardId: string;
  tier: Tier;
  questionType: QuestionType;
  question: string;
  options?: string[];
  sequenceItems?: string[];
  correctAnswer: string | string[];
  explanation: string;
  distractorRationale: string;
  themeHook: string;
  hint?: string;
}

// ─── Game State ───
export interface GameSession {
  currentQuestionIndex: number;
  questions: Question[];
  answers: AnswerRecord[];
  startedAt: number;
  subject: Subject | 'mixed';
  streak: number;
}

export interface AnswerRecord {
  questionId: string;
  correct: boolean;
  answer: string | string[];
  xpEarned: number;
  timestamp: number;
}

// ─── Progression ───
export interface StandardProgress {
  standardId: string;
  subject: Subject;
  currentTier: Tier;
  correctAtTier: number;
  wrongAtTier: number;
  totalAttempts: number;
  totalCorrect: number;
}

export interface PlayerProgress {
  xp: number;
  totalXp: number;
  level: number;
  streak: number;
  bestStreak: number;
  dailyStreak: number;
  lastPlayDate: string;
  evidencePieces: number;
  totalQuestionsAnswered: number;
  totalCorrect: number;
  standardProgress: Record<string, StandardProgress>;
  unlockedCryptids: string[];
  discoveredCryptids: string[];
  activeInvestigation: string | null;
  investigationProgress: Record<string, InvestigationProgress>;
  fieldSupplies: number;
}

export interface InvestigationProgress {
  cryptidId: string;
  cluesFound: number;
  totalClues: number;
  evidenceCollected: number;
  evidenceNeeded: number;
  completed: boolean;
}

// ─── Shop ───
export type ShopCategory = 'hat' | 'binoculars' | 'vest' | 'flashlight' | 'journal' | 'sticker' | 'accessory';
export type EquipmentSlot = 'head' | 'eyes' | 'body' | 'hand' | 'accessory';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: ShopCategory;
  equipSlot?: EquipmentSlot;
  price: number;
  svgIcon: string;
  rarity: 'common' | 'rare' | 'legendary';
}

// ─── Cryptid Theme ───
export interface CryptidLore {
  originStory: string;
  famousSightings: string[];
  louisianaConnection: string;
  funFacts: string[];
  fieldNotes: string;
}

export interface Cryptid {
  id: string;
  name: string;
  description: string;
  region: string;
  difficulty: number;
  evidenceRequired: number;
  svgSilhouette: string;
  clues: CryptidClue[];
  cardStats: {
    danger: number;
    stealth: number;
    mystery: number;
  };
  lore: CryptidLore;
}

export interface CryptidClue {
  id: string;
  type: 'sketch' | 'footprint' | 'witness' | 'map_pin' | 'photo' | 'sample';
  description: string;
  svgIcon: string;
  revealed: boolean;
}

// ─── Theme Engine ───
export interface ThemeConfig {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textLight: string;
    success: string;
    error: string;
    warning: string;
  };
  narrativeTemplates: Record<string, string>;
  milestoneMessages: Record<string, string>;
}

// ─── Dashboard ───
export interface DashboardData {
  student: UserProfile;
  progress: PlayerProgress;
  subjectAccuracy: Record<Subject, number>;
  standardMastery: Record<string, 'green' | 'yellow' | 'red'>;
  recentActivity: ActivityEntry[];
  struggleAlerts: StrugleAlert[];
}

export interface ActivityEntry {
  date: string;
  subject: Subject;
  questionsAnswered: number;
  accuracy: number;
  xpEarned: number;
}

export interface StrugleAlert {
  standardId: string;
  subject: Subject;
  accuracy: number;
  attempts: number;
}

// ─── Cross-Subject Chains ───
export interface QuestionChain {
  id: string;
  name: string;
  description: string;
  steps: ChainStep[];
}

export interface ChainStep {
  subject: Subject;
  questionId: string;
  narrativeIntro: string;
  narrativeSuccess: string;
}
