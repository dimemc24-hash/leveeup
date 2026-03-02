/**
 * XP calculation, streak tracking, and milestone detection for LeveeUp.
 */

import type { Tier, PlayerProgress } from '../types';

// ─── Milestone events ───

export interface MilestoneEvent {
  type: 'evidence_found' | 'cryptid_unlocked' | 'cryptid_discovered' | 'level_up';
  message: string;
  data?: Record<string, unknown>;
}

// ─── Base XP by tier ───

const BASE_XP: Record<Tier, number> = {
  introductory: 10,
  developing: 25,
  mastery: 50,
};

const WRONG_ANSWER_XP = 1;

// ─── XP calculation ───

/**
 * Calculate the XP earned for a single answer.
 *
 * - Correct answers earn tier-based XP modified by the current streak.
 * - Wrong answers always earn 1 XP (partial credit for participation).
 */
export function calculateXP(tier: Tier, streak: number, correct: boolean): number {
  if (!correct) return WRONG_ANSWER_XP;

  const base = BASE_XP[tier];
  const multiplier = getStreakMultiplier(streak);
  return base * multiplier;
}

// ─── Streak helpers ───

/**
 * Return the XP multiplier for the given streak count.
 *
 * Thresholds (inclusive):
 *   10+ correct in a row  -> 5x
 *    5+ correct in a row  -> 3x
 *    3+ correct in a row  -> 2x
 *    otherwise            -> 1x
 */
export function getStreakMultiplier(streak: number): number {
  if (streak >= 10) return 5;
  if (streak >= 5) return 3;
  if (streak >= 3) return 2;
  return 1;
}

/**
 * Return a display label when the player hits a streak milestone,
 * or `null` if no label should be shown.
 */
export function getStreakLabel(streak: number): string | null {
  if (streak >= 10) return '5x Mega Streak!';
  if (streak >= 5) return '3x Combo!';
  if (streak >= 3) return '2x Streak!';
  return null;
}

// ─── Milestone detection ───

/** How many answered questions produce one evidence piece. */
const QUESTIONS_PER_EVIDENCE = 10;

/** How many evidence pieces unlock a new cryptid location. */
const EVIDENCE_PER_CRYPTID = 5;

/**
 * Check whether answering additional questions triggers any milestones.
 *
 * This is intended to be called *after* updating `totalQuestionsAnswered`
 * but *before* persisting, so we can compare old and new counts.
 *
 * @param progress - The player's progress **before** the current batch of answers.
 * @param newEvidence - Number of newly earned evidence pieces this batch.
 * @returns An array of milestone events that just triggered (may be empty).
 */
export function checkMilestones(
  progress: PlayerProgress,
  newEvidence: number,
): MilestoneEvent[] {
  const events: MilestoneEvent[] = [];

  // --- Evidence milestones ---
  // Every QUESTIONS_PER_EVIDENCE questions answered earns an evidence piece.
  const prevEvidence = progress.evidencePieces;
  const totalEvidence = prevEvidence + newEvidence;

  if (newEvidence > 0) {
    events.push({
      type: 'evidence_found',
      message: `You found ${newEvidence} new evidence piece${newEvidence > 1 ? 's' : ''}!`,
      data: { newEvidence, totalEvidence },
    });
  }

  // --- Cryptid-location unlock ---
  // Every EVIDENCE_PER_CRYPTID evidence pieces unlocks a new cryptid.
  const prevUnlocks = Math.floor(prevEvidence / EVIDENCE_PER_CRYPTID);
  const newUnlocks = Math.floor(totalEvidence / EVIDENCE_PER_CRYPTID);

  if (newUnlocks > prevUnlocks) {
    const count = newUnlocks - prevUnlocks;
    events.push({
      type: 'cryptid_unlocked',
      message: `You unlocked ${count} new cryptid location${count > 1 ? 's' : ''}!`,
      data: { unlocksTriggered: count },
    });
  }

  return events;
}

/**
 * Compute how many evidence pieces a batch of answers earns, based on
 * the total-questions-answered counter crossing multiples of QUESTIONS_PER_EVIDENCE.
 *
 * @param prevTotal - totalQuestionsAnswered before this batch
 * @param answeredThisBatch - number of questions answered in the current session / batch
 */
export function computeNewEvidence(prevTotal: number, answeredThisBatch: number): number {
  const newTotal = prevTotal + answeredThisBatch;
  return Math.floor(newTotal / QUESTIONS_PER_EVIDENCE) - Math.floor(prevTotal / QUESTIONS_PER_EVIDENCE);
}

/**
 * Calculate the player level from total XP.
 * Simple formula: level = floor(totalXp / 100) + 1
 */
export function levelFromXP(totalXp: number): number {
  return Math.floor(totalXp / 100) + 1;
}
