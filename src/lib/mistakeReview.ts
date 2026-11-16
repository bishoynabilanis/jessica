/**
 * Spaced repetition for the mistakes notebook.
 *
 * A missed question is not a note to reread — it is a question that has to
 * come back. The schedule is short and forgiving:
 *
 *   3 days → 7 days → 21 days → 45 days → mastered
 *
 * A right answer moves one step; a wrong one sends it back to tomorrow.
 * Everything stays local and additive, so a profile written before this
 * feature simply treats its old mistakes as due once they are three days old.
 */

export const REVIEW_DAYS = [3, 7, 21, 45] as const
export const MISSED_AGAIN_DAYS = 1
export const DAY_MS = 86_400_000
/** Sentinels rather than `Infinity`, which JSON turns into `null`. */
export const MASTERED_AT = Number.MAX_SAFE_INTEGER

export interface Reviewable {
  createdAt: number
  reviewAt?: number
  reviewStep?: number
  reviewedAt?: number
}

export interface ReviewSchedule {
  reviewAt: number
  reviewStep: number
  reviewedAt?: number
}

/** A new mistake waits three days before its first comeback. */
export function initialReview(now = Date.now()): ReviewSchedule {
  return { reviewAt: now + REVIEW_DAYS[0] * DAY_MS, reviewStep: 0 }
}

/** Move one step on a right answer, or restart from tomorrow on a miss. */
export function nextReview(step: number, correct: boolean, now = Date.now()): ReviewSchedule {
  if (!correct) {
    return { reviewAt: now + MISSED_AGAIN_DAYS * DAY_MS, reviewStep: 0, reviewedAt: now }
  }
  const next = Math.min(step + 1, REVIEW_DAYS.length)
  if (next >= REVIEW_DAYS.length) {
    return { reviewAt: MASTERED_AT, reviewStep: REVIEW_DAYS.length, reviewedAt: now }
  }
  return { reviewAt: now + REVIEW_DAYS[next] * DAY_MS, reviewStep: next, reviewedAt: now }
}

export function isMastered(item: Reviewable): boolean {
  return (item.reviewStep ?? 0) >= REVIEW_DAYS.length || item.reviewAt === MASTERED_AT
}

export function isDue(item: Reviewable, now = Date.now()): boolean {
  if (isMastered(item)) return false
  if (item.reviewAt === undefined) return item.createdAt + REVIEW_DAYS[0] * DAY_MS <= now
  return item.reviewAt <= now
}

/** Whole days until the next comeback (0 when it is due now). */
export function daysUntilDue(item: Reviewable, now = Date.now()): number {
  if (isDue(item, now)) return 0
  const at = item.reviewAt ?? item.createdAt + REVIEW_DAYS[0] * DAY_MS
  return Math.max(1, Math.ceil((at - now) / DAY_MS))
}

export function dueMistakes<T extends Reviewable>(items: T[], now = Date.now()): T[] {
  return items.filter((item) => isDue(item, now))
}
