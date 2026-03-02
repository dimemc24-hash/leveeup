/**
 * Data abstraction layer for LeveeUp.
 *
 * Currently backed by localStorage. Every data operation flows through
 * this module so the persistence back-end (e.g. Supabase) can be swapped
 * later without touching the rest of the app.
 */

import type {
  UserProfile,
  PlayerProgress,
  ActivityEntry,
  InvestigationProgress,
} from '../types';

// ─── Key helpers ───

const PREFIX = 'leveeup_';

const KEYS = {
  profiles: `${PREFIX}profiles`,
  activeProfileId: `${PREFIX}active_profile_id`,
  progress: (profileId: string) => `${PREFIX}progress_${profileId}`,
  inventory: (profileId: string) => `${PREFIX}inventory_${profileId}`,
  activityLog: (profileId: string) => `${PREFIX}activity_${profileId}`,
} as const;

// ─── Serialisation helpers ───

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// ─── Default data ───

const DEFAULT_INVESTIGATION: InvestigationProgress = {
  cryptidId: 'honey-island-swamp-monster',
  cluesFound: 0,
  totalClues: 5,
  evidenceCollected: 0,
  evidenceNeeded: 5,
  completed: false,
};

export const DEFAULT_PROGRESS: PlayerProgress = {
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
    'honey-island-swamp-monster': { ...DEFAULT_INVESTIGATION },
  },
  fieldSupplies: 1,
};

// ─── Profile operations ───

export function getAllProfiles(): UserProfile[] {
  return read<UserProfile[]>(KEYS.profiles, []);
}

export function getProfile(profileId: string): UserProfile | null {
  const profiles = getAllProfiles();
  return profiles.find((p) => p.id === profileId) ?? null;
}

export function setProfile(profile: UserProfile): void {
  const profiles = getAllProfiles();
  const idx = profiles.findIndex((p) => p.id === profile.id);
  if (idx >= 0) {
    profiles[idx] = profile;
  } else {
    profiles.push(profile);
  }
  write(KEYS.profiles, profiles);
}

export function getActiveProfileId(): string | null {
  return read<string | null>(KEYS.activeProfileId, null);
}

export function setActiveProfileId(profileId: string): void {
  write(KEYS.activeProfileId, profileId);
}

// ─── Progress operations ───

export function getProgress(profileId: string): PlayerProgress {
  return read<PlayerProgress>(KEYS.progress(profileId), { ...DEFAULT_PROGRESS });
}

export function setProgress(profileId: string, progress: PlayerProgress): void {
  write(KEYS.progress(profileId), progress);
}

// ─── Inventory operations ───

export function getInventory(profileId: string): string[] {
  return read<string[]>(KEYS.inventory(profileId), []);
}

export function addToInventory(profileId: string, itemId: string): void {
  const inventory = getInventory(profileId);
  if (!inventory.includes(itemId)) {
    inventory.push(itemId);
    write(KEYS.inventory(profileId), inventory);
  }
}

// ─── Activity log operations ───

export function getActivityLog(profileId: string): ActivityEntry[] {
  return read<ActivityEntry[]>(KEYS.activityLog(profileId), []);
}

export function addActivity(profileId: string, entry: ActivityEntry): void {
  const log = getActivityLog(profileId);
  log.push(entry);
  write(KEYS.activityLog(profileId), log);
}

// ─── Utility ───

/**
 * Remove all LeveeUp data from localStorage.
 * Useful for testing and development resets.
 */
export function clear(): void {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(PREFIX)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((key) => localStorage.removeItem(key));
}

// Convenience namespace so consumers can write `storage.getProfile(id)` etc.
export const storage = {
  getAllProfiles,
  getProfile,
  setProfile,
  getActiveProfileId,
  setActiveProfileId,
  getProgress,
  setProgress,
  getInventory,
  addToInventory,
  getActivityLog,
  addActivity,
  clear,
};
