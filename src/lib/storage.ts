/**
 * Data abstraction layer for LeveeUp.
 *
 * Uses Supabase as the primary back-end with an in-memory cache for
 * synchronous reads.  Falls back to localStorage when offline or
 * unauthenticated so the PWA still works without connectivity.
 */

import { supabase } from './supabase';
import type {
  UserProfile,
  PlayerProgress,
  ActivityEntry,
  InvestigationProgress,
} from '../types';

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

// ─── In-memory cache ───

let _profiles: UserProfile[] = [];
let _activeProfileId: string | null = null;
let _progress: Record<string, PlayerProgress> = {};
let _inventory: Record<string, string[]> = {};
let _activityLog: Record<string, ActivityEntry[]> = {};
let _authUserId: string | null = null;
let _authUserRole: string | null = null;
let _supabaseReady = false;

// ─── localStorage fallback helpers ───

const PREFIX = 'leveeup_';

const LS_KEYS = {
  profiles: `${PREFIX}profiles`,
  activeProfileId: `${PREFIX}active_profile_id`,
  progress: (id: string) => `${PREFIX}progress_${id}`,
  inventory: (id: string) => `${PREFIX}inventory_${id}`,
  activityLog: (id: string) => `${PREFIX}activity_${id}`,
} as const;

function lsRead<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function lsWrite<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage may be full or unavailable
  }
}

// ─── Supabase initialisation ───

/**
 * Load data from Supabase for the current authenticated user.
 * Call this after successful auth.  Returns true on success.
 */
export async function initializeFromSupabase(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    _authUserId = user.id;

    // Fetch user record for role (auto-create if missing)
    let { data: userRecord } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!userRecord) {
      // Auto-create the users row from auth metadata
      const { data: inserted, error: insertErr } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email ?? '',
          role: (user.user_metadata as Record<string, string>)?.role ?? 'parent',
          display_name:
            (user.user_metadata as Record<string, string>)?.display_name ??
            (user.email?.split('@')[0] ?? 'User'),
        })
        .select()
        .single();
      if (insertErr || !inserted) return false;
      userRecord = inserted;
    }

    _authUserRole = userRecord.role;
    _profiles = [];
    _progress = {};
    _inventory = {};
    _activityLog = {};

    // Add parent / teacher profile for dashboard access
    if (userRecord.role !== 'student') {
      _profiles.push({
        id: user.id,
        name: userRecord.display_name,
        role: userRecord.role.toUpperCase() as 'PARENT' | 'TEACHER',
        equippedItems: [],
        createdAt: new Date(userRecord.created_at).getTime(),
      });
    }

    // Fetch student profiles belonging to this user
    const { data: students } = await supabase
      .from('students')
      .select('*')
      .or(`user_id.eq.${user.id},parent_id.eq.${user.id},teacher_id.eq.${user.id}`);

    if (students) {
      for (const s of students) {
        const avatarConfig = (s.avatar_config as { equippedItems?: string[] } | null) ?? {};
        _profiles.push({
          id: s.id,
          name: s.display_name,
          role: 'STUDENT',
          equippedItems: avatarConfig.equippedItems ?? [],
          createdAt: new Date(s.created_at).getTime(),
        });
        _progress[s.id] = (s.game_state as PlayerProgress | null) ?? { ...DEFAULT_PROGRESS };
        _inventory[s.id] = (s.owned_items as string[] | null) ?? [];
        _activityLog[s.id] = (s.activity_log as ActivityEntry[] | null) ?? [];
      }
    }

    _supabaseReady = true;
    return true;
  } catch {
    return false;
  }
}

/** Reset all caches (used on logout). */
export function resetCache(): void {
  _profiles = [];
  _activeProfileId = null;
  _progress = {};
  _inventory = {};
  _activityLog = {};
  _authUserId = null;
  _authUserRole = null;
  _supabaseReady = false;
}

// ─── Profile operations ───

export function getAllProfiles(): UserProfile[] {
  if (_supabaseReady) return [..._profiles];
  return lsRead<UserProfile[]>(LS_KEYS.profiles, []);
}

export function getProfile(profileId: string): UserProfile | null {
  const profiles = getAllProfiles();
  return profiles.find((p) => p.id === profileId) ?? null;
}

export function setProfile(profile: UserProfile): void {
  // Update cache
  const idx = _profiles.findIndex((p) => p.id === profile.id);
  if (idx >= 0) {
    _profiles[idx] = profile;
  } else {
    _profiles.push(profile);
  }

  if (_supabaseReady && profile.role === 'STUDENT' && _authUserId) {
    if (idx >= 0) {
      // Update existing
      supabase
        .from('students')
        .update({
          display_name: profile.name,
          avatar_config: { equippedItems: profile.equippedItems },
        })
        .eq('id', profile.id)
        .then(null, () => {});
    } else {
      // Insert new student
      supabase
        .from('students')
        .insert({
          id: profile.id,
          user_id: _authUserId,
          parent_id: _authUserRole !== 'student' ? _authUserId : null,
          display_name: profile.name,
          avatar_config: { equippedItems: profile.equippedItems },
        })
        .then(null, () => {});
    }
  }

  // localStorage fallback
  const all = lsRead<UserProfile[]>(LS_KEYS.profiles, []);
  const lsIdx = all.findIndex((p) => p.id === profile.id);
  if (lsIdx >= 0) all[lsIdx] = profile;
  else all.push(profile);
  lsWrite(LS_KEYS.profiles, all);
}

export function getActiveProfileId(): string | null {
  return _activeProfileId ?? lsRead<string | null>(LS_KEYS.activeProfileId, null);
}

export function setActiveProfileId(profileId: string): void {
  _activeProfileId = profileId;
  lsWrite(LS_KEYS.activeProfileId, profileId);
}

// ─── Progress operations ───

export function getProgress(profileId: string): PlayerProgress {
  if (_supabaseReady && _progress[profileId]) {
    return _progress[profileId];
  }
  return lsRead<PlayerProgress>(LS_KEYS.progress(profileId), { ...DEFAULT_PROGRESS });
}

export function setProgress(profileId: string, progress: PlayerProgress): void {
  _progress[profileId] = progress;

  if (_supabaseReady) {
    supabase
      .from('students')
      .update({
        game_state: progress,
        total_xp: progress.totalXp,
      })
      .eq('id', profileId)
      .then(null, () => {});
  }

  lsWrite(LS_KEYS.progress(profileId), progress);
}

// ─── Inventory operations ───

export function getInventory(profileId: string): string[] {
  if (_supabaseReady && _inventory[profileId]) {
    return _inventory[profileId];
  }
  return lsRead<string[]>(LS_KEYS.inventory(profileId), []);
}

export function addToInventory(profileId: string, itemId: string): void {
  const inv = getInventory(profileId);
  if (!inv.includes(itemId)) {
    inv.push(itemId);
  }
  _inventory[profileId] = inv;

  if (_supabaseReady) {
    supabase
      .from('students')
      .update({ owned_items: inv })
      .eq('id', profileId)
      .then(null, () => {});
  }

  lsWrite(LS_KEYS.inventory(profileId), inv);
}

// ─── Activity log operations ───

export function getActivityLog(profileId: string): ActivityEntry[] {
  if (_supabaseReady && _activityLog[profileId]) {
    return _activityLog[profileId];
  }
  return lsRead<ActivityEntry[]>(LS_KEYS.activityLog(profileId), []);
}

export function addActivity(profileId: string, entry: ActivityEntry): void {
  const log = getActivityLog(profileId);
  log.push(entry);
  _activityLog[profileId] = log;

  if (_supabaseReady) {
    supabase
      .from('students')
      .update({ activity_log: log })
      .eq('id', profileId)
      .then(null, () => {});

    // Also write to daily_activity for analytics
    supabase
      .from('daily_activity')
      .upsert(
        {
          student_id: profileId,
          date: entry.date,
          sessions_count: 1,
          questions_answered: entry.questionsAnswered,
          questions_correct: Math.round((entry.accuracy / 100) * entry.questionsAnswered),
          xp_earned: entry.xpEarned,
        },
        { onConflict: 'student_id,date' },
      )
      .then(null, () => {});
  }

  lsWrite(LS_KEYS.activityLog(profileId), log);
}

// ─── Utility ───

export function clear(): void {
  resetCache();
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(PREFIX)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((key) => localStorage.removeItem(key));
}

// ─── Convenience namespace ───

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
  initializeFromSupabase,
  resetCache,
};
