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

// ─── Supabase write retry queue ───

const RETRY_KEY = 'lv_pending_writes';
type PendingWrite = { table: string; id: string; payload: Record<string, unknown>; ts: number };
function queueRetry(table: string, id: string, payload: Record<string, unknown>) {
  try {
    const existing = JSON.parse(localStorage.getItem(RETRY_KEY) ?? '[]') as PendingWrite[];
    const filtered = existing.filter(w => !(w.table === table && w.id === id));
    filtered.push({ table, id, payload, ts: Date.now() });
    localStorage.setItem(RETRY_KEY, JSON.stringify(filtered.slice(-20)));
  } catch { /* ignore */ }
}
async function flushRetryQueue() {
  if (!_supabaseReady) return;
  try {
    const pending = JSON.parse(localStorage.getItem(RETRY_KEY) ?? '[]') as PendingWrite[];
    if (!pending.length) return;
    localStorage.removeItem(RETRY_KEY);
    for (const w of pending) { await supabase.from(w.table).update(w.payload).eq('id', w.id); }
  } catch { /* ignore */ }
}
if (typeof window !== 'undefined') {
  window.addEventListener('focus', () => { flushRetryQueue().catch(() => {}); });
  window.addEventListener('online', () => { flushRetryQueue().catch(() => {}); });
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

/** Default player progress used when no saved data exists. */
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
  pendingCapture: null,
  fieldSupplies: 1,
  cycleCompleted: [],
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

// ─── Supabase error logger ───

/**
 * Log a Supabase write error without crashing the app.
 * The app continues to function via localStorage fallback.
 */
function logSupabaseError(operation: string, err: unknown): void {
  console.warn(`[storage] Supabase ${operation} failed (offline fallback active):`, err);
}

// ─── localStorage fallback helpers ───

const PREFIX = 'leveeup_';

const LS_KEYS = {
  profiles: `${PREFIX}profiles`,
  activeProfileId: `${PREFIX}active_profile_id`,
  progress: (id: string) => `${PREFIX}progress_${id}`,
  inventory: (id: string) => `${PREFIX}inventory_${id}`,
  activityLog: (id: string) => `${PREFIX}activity_${id}`,
} as const;

/**
 * Read a JSON value from localStorage, returning `fallback` on any error.
 */
function lsRead<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/**
 * Write a JSON value to localStorage, silently failing if storage is full.
 */
function lsWrite<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage may be full or unavailable in some browsers
  }
}

// ─── Supabase initialisation ───

/**
 * Load data from Supabase for the current authenticated user.
 * Call this after successful auth. Populates the in-memory cache
 * and marks Supabase as the primary data source.
 *
 * @returns `true` if initialization succeeded, `false` otherwise.
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
        skinTone: 'medium',
        hairColor: 'brown',
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
          skinTone: (avatarConfig as Record<string, string>).skinTone as UserProfile['skinTone'] ?? 'medium',
          hairColor: (avatarConfig as Record<string, string>).hairColor as UserProfile['hairColor'] ?? 'brown',
          createdAt: new Date(s.created_at).getTime(),
        });
        _progress[s.id] = (s.game_state as PlayerProgress | null) ?? { ...DEFAULT_PROGRESS };
        _inventory[s.id] = (s.owned_items as string[] | null) ?? [];
        _activityLog[s.id] = (s.activity_log as ActivityEntry[] | null) ?? [];
      }
    }

    _supabaseReady = true;
    flushRetryQueue().catch(() => {});
    return true;
  } catch (err) {
    logSupabaseError('initializeFromSupabase', err);
    return false;
  }
}

/**
 * Reset all in-memory caches. Called on logout.
 */
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

/**
 * Return all known user profiles from the cache or localStorage fallback.
 */
export function getAllProfiles(): UserProfile[] {
  if (_supabaseReady) return [..._profiles];
  return lsRead<UserProfile[]>(LS_KEYS.profiles, []);
}

/**
 * Retrieve a single profile by ID, or `null` if not found.
 */
export function getProfile(profileId: string): UserProfile | null {
  const profiles = getAllProfiles();
  return profiles.find((p) => p.id === profileId) ?? null;
}

/**
 * Persist a profile to the cache, Supabase, and localStorage.
 * Creates a new student record in Supabase if the profile is new.
 */
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
      supabase
        .from('students')
        .update({
          display_name: profile.name,
          avatar_config: { equippedItems: profile.equippedItems, skinTone: profile.skinTone, hairColor: profile.hairColor },
        })
        .eq('id', profile.id)
        .then(null, (err) => logSupabaseError('setProfile.update', err));
    } else {
      supabase
        .from('students')
        .insert({
          id: profile.id,
          user_id: _authUserId,
          parent_id: _authUserRole !== 'student' ? _authUserId : null,
          display_name: profile.name,
          avatar_config: { equippedItems: profile.equippedItems, skinTone: profile.skinTone, hairColor: profile.hairColor },
        })
        .then(null, (err) => logSupabaseError('setProfile.insert', err));
    }
  }

  // localStorage fallback
  const all = lsRead<UserProfile[]>(LS_KEYS.profiles, []);
  const lsIdx = all.findIndex((p) => p.id === profile.id);
  if (lsIdx >= 0) all[lsIdx] = profile;
  else all.push(profile);
  lsWrite(LS_KEYS.profiles, all);
}

/**
 * Return the currently active profile ID from cache or localStorage.
 */
export function getActiveProfileId(): string | null {
  return _activeProfileId ?? lsRead<string | null>(LS_KEYS.activeProfileId, null);
}

/**
 * Set the active profile ID in cache and localStorage.
 */
export function setActiveProfileId(profileId: string): void {
  _activeProfileId = profileId;
  lsWrite(LS_KEYS.activeProfileId, profileId);
}

// ─── Progress operations ───

/**
 * Retrieve a player's progress from the cache or localStorage fallback.
 */
export function getProgress(profileId: string): PlayerProgress {
  if (_supabaseReady && _progress[profileId]) {
    return _progress[profileId];
  }
  return lsRead<PlayerProgress>(LS_KEYS.progress(profileId), { ...DEFAULT_PROGRESS });
}

/**
 * Persist player progress to the cache, Supabase, and localStorage.
 */
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
      .then(null, () => queueRetry('students', profileId, { game_state: progress, total_xp: progress.totalXp }));
  }

  lsWrite(LS_KEYS.progress(profileId), progress);
}

// ─── Inventory operations ───

/**
 * Retrieve a player's owned item IDs from the cache or localStorage fallback.
 */
export function getInventory(profileId: string): string[] {
  if (_supabaseReady && _inventory[profileId]) {
    return _inventory[profileId];
  }
  return lsRead<string[]>(LS_KEYS.inventory(profileId), []);
}

/**
 * Add an item to a player's inventory in cache, Supabase, and localStorage.
 */
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
      .then(null, (err) => logSupabaseError('addToInventory', err));
  }

  lsWrite(LS_KEYS.inventory(profileId), inv);
}

// ─── Activity log operations ───

/**
 * Retrieve a player's activity log from the cache or localStorage fallback.
 */
export function getActivityLog(profileId: string): ActivityEntry[] {
  if (_supabaseReady && _activityLog[profileId]) {
    return _activityLog[profileId];
  }
  return lsRead<ActivityEntry[]>(LS_KEYS.activityLog(profileId), []);
}

/**
 * Append an activity entry to the player's log in cache, Supabase, and localStorage.
 * Also upserts to the `daily_activity` table for analytics.
 */
export function addActivity(profileId: string, entry: ActivityEntry): void {
  const log = getActivityLog(profileId);
  log.push(entry);
  _activityLog[profileId] = log;

  if (_supabaseReady) {
    supabase
      .from('students')
      .update({ activity_log: log })
      .eq('id', profileId)
      .then(null, (err) => logSupabaseError('addActivity.log', err));

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
      .then(null, (err) => logSupabaseError('addActivity.daily', err));
  }

  lsWrite(LS_KEYS.activityLog(profileId), log);
}

// ─── Utility ───

/**
 * Clear all LeveeUp data from both the in-memory cache and localStorage.
 */
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

/** Bundled storage API for convenient single-import usage. */
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
