/**
 * Question selection engine with adaptive difficulty for LeveeUp.
 *
 * Selects questions based on the student's per-standard tier, mixes
 * across standards within a subject, and adapts difficulty up or down
 * based on recent performance.
 */

import type { Question, Subject, Tier, StandardProgress } from '../types';
// The questions data module is expected to default-export (or named-export)
// an array of Question objects. Adjust the import if the shape changes.
import { questions as questionBank } from '../data/questions';

// ─── Tier helpers ───

const TIER_ORDER: Tier[] = ['introductory', 'developing', 'mastery'];

/**
 * Return the next harder tier, or `null` if already at mastery.
 */
export function getNextTier(current: Tier): Tier | null {
  const idx = TIER_ORDER.indexOf(current);
  return idx < TIER_ORDER.length - 1 ? TIER_ORDER[idx + 1] : null;
}

/**
 * Return the previous (easier) tier, or `null` if already at introductory.
 */
export function getPrevTier(current: Tier): Tier | null {
  const idx = TIER_ORDER.indexOf(current);
  return idx > 0 ? TIER_ORDER[idx - 1] : null;
}

// ─── Adaptive difficulty ───

/** Advance the tier after this many consecutive correct answers at the current tier. */
const ADVANCE_THRESHOLD = 3;

/** Drop back a tier after this many wrong answers at the current tier. */
const DROP_THRESHOLD = 2;

/**
 * Should the student advance to the next tier for a given standard?
 */
export function shouldAdvanceTier(sp: StandardProgress): boolean {
  return sp.correctAtTier >= ADVANCE_THRESHOLD;
}

/**
 * Should the student drop to the previous tier for a given standard?
 */
export function shouldDropTier(sp: StandardProgress): boolean {
  return sp.wrongAtTier >= DROP_THRESHOLD;
}

// ─── Question selection ───

/**
 * Determine the effective tier for a standard, falling back to
 * `introductory` when no progress exists yet.
 */
function effectiveTier(
  standardId: string,
  standardProgress: Record<string, StandardProgress>,
): Tier {
  const sp = standardProgress[standardId];
  return sp ? sp.currentTier : 'introductory';
}

/**
 * Shuffle an array in place (Fisher-Yates) and return it.
 */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Build a session of questions tailored to the student's current ability.
 *
 * @param subject - The subject to draw from, or `'mixed'` to pull from
 *   all subjects weighted by weakness.
 * @param standardProgress - The student's per-standard progress map.
 * @param count - Number of questions to return (default 10).
 * @param recentQuestionIds - Question IDs to avoid if alternatives exist.
 * @returns An array of up to `count` questions.
 */
export function getQuestionsForSession(
  subject: Subject | 'mixed',
  standardProgress: Record<string, StandardProgress>,
  count: number = 10,
  recentQuestionIds: string[] = [],
): Question[] {
  // 1. Filter the bank to the requested subject(s).
  let pool: Question[];

  if (subject === 'mixed') {
    // Weight towards the weakest subject so the student practices where needed.
    const recommended = getRecommendedSubject(standardProgress);
    // 60 % from weakest subject, 40 % from everything else
    const weakPool = questionBank.filter((q) => q.subject === recommended);
    const otherPool = questionBank.filter((q) => q.subject !== recommended);
    pool = [...weakPool, ...weakPool, ...weakPool, ...otherPool, ...otherPool];
  } else {
    pool = questionBank.filter((q) => q.subject === subject);
  }

  // 2. Prefer questions at the student's current tier per standard.
  //    Score each question: exact tier match = 3, adjacent = 1, else 0.
  const scored = pool.map((q) => {
    const tier = effectiveTier(q.standardId, standardProgress);
    let score: number;
    if (q.tier === tier) {
      score = 3;
    } else {
      const next = getNextTier(tier);
      const prev = getPrevTier(tier);
      score = q.tier === next || q.tier === prev ? 1 : 0;
    }

    // Penalise recently-answered questions so the student sees variety.
    const recentPenalty = recentQuestionIds.includes(q.id) ? -2 : 0;

    return { question: q, score: score + recentPenalty };
  });

  // 3. Sort descending by score, then shuffle within equal scores for variety.
  scored.sort((a, b) => b.score - a.score);

  // Group by score, shuffle within each group, then flatten.
  const groups = new Map<number, Question[]>();
  for (const s of scored) {
    const arr = groups.get(s.score) ?? [];
    arr.push(s.question);
    groups.set(s.score, arr);
  }

  const ordered: Question[] = [];
  // Iterate scores in descending order
  const sortedScores = [...groups.keys()].sort((a, b) => b - a);
  for (const score of sortedScores) {
    const group = groups.get(score)!;
    ordered.push(...shuffle(group));
  }

  // 4. De-duplicate by question id and take up to `count`.
  const seen = new Set<string>();
  const result: Question[] = [];
  for (const q of ordered) {
    if (seen.has(q.id)) continue;
    seen.add(q.id);
    result.push(q);
    if (result.length >= count) break;
  }

  // 5. Shuffle the final set so the session isn't ordered by difficulty.
  return shuffle(result);
}

// ─── Subject recommendation ───

const ALL_SUBJECTS: Subject[] = ['math', 'ela', 'science', 'social_studies'];

/**
 * Determine which subject the student is weakest in, based on overall
 * accuracy across all standards in each subject.
 *
 * If there is no data yet, defaults to `'math'`.
 */
export function getRecommendedSubject(
  standardProgress: Record<string, StandardProgress>,
): Subject {
  const entries = Object.values(standardProgress);

  if (entries.length === 0) return 'math';

  // Accumulate per-subject totals.
  const totals: Record<Subject, { correct: number; attempts: number }> = {
    math: { correct: 0, attempts: 0 },
    ela: { correct: 0, attempts: 0 },
    science: { correct: 0, attempts: 0 },
    social_studies: { correct: 0, attempts: 0 },
  };

  for (const sp of entries) {
    const bucket = totals[sp.subject];
    if (bucket) {
      bucket.correct += sp.totalCorrect;
      bucket.attempts += sp.totalAttempts;
    }
  }

  // Find the subject with the lowest accuracy. Subjects with zero attempts
  // are treated as having 0 % accuracy so the student is steered there.
  let weakest: Subject = 'math';
  let lowestAccuracy = Infinity;

  for (const subj of ALL_SUBJECTS) {
    const { correct, attempts } = totals[subj];
    const accuracy = attempts > 0 ? correct / attempts : 0;
    if (accuracy < lowestAccuracy) {
      lowestAccuracy = accuracy;
      weakest = subj;
    }
  }

  return weakest;
}
