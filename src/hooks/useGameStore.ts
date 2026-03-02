import { create } from 'zustand';
import type { UserProfile, PlayerProgress, Subject, Tier, GameSession, AnswerRecord, Question, StandardProgress, InvestigationProgress } from '../types';
import { storage } from '../lib/storage';
import { calculateXP, getStreakMultiplier, checkMilestones, type MilestoneEvent } from '../lib/scoring';

interface GameStore {
  // Auth
  profile: UserProfile | null;
  profiles: UserProfile[];
  loadProfiles: () => void;
  setProfile: (p: UserProfile) => void;
  createProfile: (name: string, role: UserProfile['role']) => void;
  logout: () => void;

  // Progress
  progress: PlayerProgress;
  loadProgress: () => void;
  addXP: (amount: number) => void;

  // Game session
  session: GameSession | null;
  startSession: (questions: Question[], subject: Subject | 'mixed') => void;
  answerQuestion: (answer: string | string[]) => { correct: boolean; xp: number; milestones: MilestoneEvent[] };
  nextQuestion: () => boolean;
  endSession: () => void;

  // Inventory
  ownedItems: string[];
  loadInventory: () => void;
  buyItem: (itemId: string, price: number) => boolean;
  equipItem: (itemId: string) => void;
  unequipItem: (itemId: string) => void;

  // Adaptive
  updateStandardProgress: (standardId: string, subject: Subject, correct: boolean) => void;
  getCurrentTier: (standardId: string) => Tier;
  consecutiveFailures: number;
  sessionSubjectTime: number;
  resetFailures: () => void;
}

const defaultProgress: PlayerProgress = {
  xp: 0,
  totalXp: 0,
  level: 1,
  streak: 0,
  bestStreak: 0,
  dailyStreak: 0,
  lastPlayDate: '',
  evidencePieces: 0,
  totalQuestionsAnswered: 0,
  totalCorrect: 0,
  standardProgress: {},
  unlockedCryptids: ['honey-island-swamp-monster'],
  discoveredCryptids: [],
  activeInvestigation: 'honey-island-swamp-monster',
  investigationProgress: {
    'honey-island-swamp-monster': {
      cryptidId: 'honey-island-swamp-monster',
      cluesFound: 0,
      totalClues: 5,
      evidenceCollected: 0,
      evidenceNeeded: 5,
      completed: false,
    },
  },
  fieldSupplies: 1,
};

export const useGameStore = create<GameStore>((set, get) => ({
  // Auth
  profile: null,
  profiles: [],

  loadProfiles() {
    const profiles = storage.getAllProfiles();
    set({ profiles });
  },

  setProfile(p: UserProfile) {
    storage.setProfile(p);
    const progress = storage.getProgress(p.id) ?? defaultProgress;
    const ownedItems = storage.getInventory(p.id);
    // Check daily login
    const today = new Date().toISOString().slice(0, 10);
    if (progress.lastPlayDate !== today) {
      progress.dailyStreak = progress.lastPlayDate === getPreviousDate(today) ? progress.dailyStreak + 1 : 1;
      progress.lastPlayDate = today;
      progress.fieldSupplies += 1;
      storage.setProgress(p.id, progress);
    }
    set({ profile: p, progress, ownedItems });
  },

  createProfile(name: string, role: UserProfile['role']) {
    const id = 'user_' + Date.now().toString(36);
    const p: UserProfile = { id, name, role, equippedItems: [], createdAt: Date.now() };
    storage.setProfile(p);
    storage.setProgress(id, defaultProgress);
    get().loadProfiles();
    get().setProfile(p);
  },

  logout() {
    set({ profile: null, session: null });
  },

  // Progress
  progress: defaultProgress,

  loadProgress() {
    const { profile } = get();
    if (!profile) return;
    const progress = storage.getProgress(profile.id) ?? defaultProgress;
    set({ progress });
  },

  addXP(amount: number) {
    const { profile, progress } = get();
    if (!profile) return;
    const newProgress = {
      ...progress,
      xp: progress.xp + amount,
      totalXp: progress.totalXp + amount,
      level: Math.floor((progress.totalXp + amount) / 100) + 1,
    };
    storage.setProgress(profile.id, newProgress);
    set({ progress: newProgress });
  },

  // Game session
  session: null,

  startSession(questions: Question[], subject: Subject | 'mixed') {
    set({
      session: {
        currentQuestionIndex: 0,
        questions,
        answers: [],
        startedAt: Date.now(),
        subject,
        streak: 0,
      },
      consecutiveFailures: 0,
      sessionSubjectTime: Date.now(),
    });
  },

  answerQuestion(answer: string | string[]) {
    const { session, profile, progress } = get();
    if (!session || !profile) return { correct: false, xp: 0, milestones: [] };

    const question = session.questions[session.currentQuestionIndex];
    if (!question) return { correct: false, xp: 0, milestones: [] };

    const correct = Array.isArray(question.correctAnswer)
      ? Array.isArray(answer) && JSON.stringify(answer) === JSON.stringify(question.correctAnswer)
      : answer === question.correctAnswer;

    const newStreak = correct ? session.streak + 1 : 0;
    const xp = calculateXP(question.tier, newStreak, correct);

    const record: AnswerRecord = {
      questionId: question.id,
      correct,
      answer,
      xpEarned: xp,
      timestamp: Date.now(),
    };

    const newAnswers = [...session.answers, record];
    const newTotalCorrect = progress.totalCorrect + (correct ? 1 : 0);
    const newTotalAnswered = progress.totalQuestionsAnswered + 1;

    // Evidence: every 10 questions answered
    const oldEvidenceThreshold = Math.floor(progress.totalQuestionsAnswered / 10);
    const newEvidenceThreshold = Math.floor(newTotalAnswered / 10);
    const newEvidence = newEvidenceThreshold - oldEvidenceThreshold;

    let newProgress = {
      ...progress,
      xp: progress.xp + xp,
      totalXp: progress.totalXp + xp,
      level: Math.floor((progress.totalXp + xp) / 100) + 1,
      streak: newStreak,
      bestStreak: Math.max(progress.bestStreak, newStreak),
      totalQuestionsAnswered: newTotalAnswered,
      totalCorrect: newTotalCorrect,
      evidencePieces: progress.evidencePieces + newEvidence,
    };

    // Update investigation progress
    if (newEvidence > 0 && newProgress.activeInvestigation) {
      const inv = newProgress.investigationProgress[newProgress.activeInvestigation];
      if (inv && !inv.completed) {
        const newEvidenceCollected = Math.min(inv.evidenceCollected + newEvidence, inv.evidenceNeeded);
        const newClues = Math.min(Math.floor(newEvidenceCollected), inv.totalClues);
        const completed = newClues >= inv.totalClues;
        const updatedInv: InvestigationProgress = {
          ...inv,
          evidenceCollected: newEvidenceCollected,
          cluesFound: newClues,
          completed,
        };
        newProgress = {
          ...newProgress,
          investigationProgress: {
            ...newProgress.investigationProgress,
            [newProgress.activeInvestigation]: updatedInv,
          },
        };
        if (completed && newProgress.activeInvestigation && !newProgress.discoveredCryptids.includes(newProgress.activeInvestigation)) {
          newProgress.discoveredCryptids = [...newProgress.discoveredCryptids, newProgress.activeInvestigation];
        }
      }
    }

    // Update standard progress
    get().updateStandardProgress(question.standardId, question.subject, correct);

    const milestones = checkMilestones(newProgress, newEvidence);

    // Log activity
    storage.addActivity(profile.id, {
      date: new Date().toISOString().slice(0, 10),
      subject: question.subject,
      questionsAnswered: 1,
      accuracy: correct ? 100 : 0,
      xpEarned: xp,
    });

    storage.setProgress(profile.id, newProgress);

    const newFailures = correct ? 0 : get().consecutiveFailures + 1;

    set({
      session: { ...session, answers: newAnswers, streak: newStreak },
      progress: newProgress,
      consecutiveFailures: newFailures,
    });

    return { correct, xp, milestones };
  },

  nextQuestion() {
    const { session } = get();
    if (!session) return false;
    const next = session.currentQuestionIndex + 1;
    if (next >= session.questions.length) return false;
    set({ session: { ...session, currentQuestionIndex: next } });
    return true;
  },

  endSession() {
    set({ session: null, consecutiveFailures: 0 });
  },

  // Inventory
  ownedItems: [],

  loadInventory() {
    const { profile } = get();
    if (!profile) return;
    set({ ownedItems: storage.getInventory(profile.id) });
  },

  buyItem(itemId: string, price: number) {
    const { profile, progress, ownedItems } = get();
    if (!profile || progress.xp < price || ownedItems.includes(itemId)) return false;
    const newProgress = { ...progress, xp: progress.xp - price };
    storage.setProgress(profile.id, newProgress);
    storage.addToInventory(profile.id, itemId);
    set({ progress: newProgress, ownedItems: [...ownedItems, itemId] });
    return true;
  },

  equipItem(itemId: string) {
    const { profile } = get();
    if (!profile) return;
    const updated = { ...profile, equippedItems: [...profile.equippedItems, itemId] };
    storage.setProfile(updated);
    set({ profile: updated });
  },

  unequipItem(itemId: string) {
    const { profile } = get();
    if (!profile) return;
    const updated = { ...profile, equippedItems: profile.equippedItems.filter((i) => i !== itemId) };
    storage.setProfile(updated);
    set({ profile: updated });
  },

  // Adaptive difficulty
  consecutiveFailures: 0,
  sessionSubjectTime: 0,

  updateStandardProgress(standardId: string, subject: Subject, correct: boolean) {
    const { profile, progress } = get();
    if (!profile) return;
    const existing = progress.standardProgress[standardId] ?? {
      standardId,
      subject,
      currentTier: 'introductory' as Tier,
      correctAtTier: 0,
      wrongAtTier: 0,
      totalAttempts: 0,
      totalCorrect: 0,
    };

    let sp: StandardProgress = {
      ...existing,
      totalAttempts: existing.totalAttempts + 1,
      totalCorrect: existing.totalCorrect + (correct ? 1 : 0),
      correctAtTier: correct ? existing.correctAtTier + 1 : existing.correctAtTier,
      wrongAtTier: correct ? existing.wrongAtTier : existing.wrongAtTier + 1,
    };

    // Advance tier
    if (sp.correctAtTier >= 3) {
      const nextTier = sp.currentTier === 'introductory' ? 'developing' : sp.currentTier === 'developing' ? 'mastery' : null;
      if (nextTier) {
        sp = { ...sp, currentTier: nextTier, correctAtTier: 0, wrongAtTier: 0 };
      }
    }

    // Drop tier
    if (sp.wrongAtTier >= 2) {
      const prevTier = sp.currentTier === 'mastery' ? 'developing' : sp.currentTier === 'developing' ? 'introductory' : null;
      if (prevTier) {
        sp = { ...sp, currentTier: prevTier, correctAtTier: 0, wrongAtTier: 0 };
      }
    }

    const newStandardProgress = { ...progress.standardProgress, [standardId]: sp };
    const newProgress = { ...progress, standardProgress: newStandardProgress };
    storage.setProgress(profile.id, newProgress);
    set({ progress: newProgress });
  },

  getCurrentTier(standardId: string): Tier {
    return get().progress.standardProgress[standardId]?.currentTier ?? 'introductory';
  },

  resetFailures() {
    set({ consecutiveFailures: 0 });
  },
}));

function getPreviousDate(dateStr: string): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}
