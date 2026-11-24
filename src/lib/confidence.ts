import { DAY_MS, MISSED_AGAIN_DAYS } from '@/lib/mistakeReview'

/**
 * "Did you understand it, or did you guess?"
 *
 * After each answer the student can say which one it was. A right answer that
 * was a guess is not learning yet, so it counts for half when Jessica decides
 * what to practise next. A wrong answer the student felt sure about is a
 * misunderstanding, so that question comes back tomorrow instead of in three
 * days. The student is never forced to answer; skipping changes nothing.
 */

export type Confidence = 'understood' | 'guessed'

export interface SkillStat {
  correct: number
  total: number
  lastAt: number
  /** Right answers the student said were guesses. */
  guessedRight?: number
  /** Wrong answers the student was sure about. */
  understoodWrong?: number
}

/** Accuracy where a guessed right answer counts for half. */
export function effectiveAccuracy(stat: Pick<SkillStat, 'correct' | 'total' | 'guessedRight'> | undefined): number | null {
  if (!stat || !stat.total) return null
  const value = (stat.correct - 0.5 * Math.min(stat.guessedRight || 0, stat.correct)) / stat.total
  return Math.max(0, Math.min(1, value))
}

/** How many answers in a stat were flagged as guesses (for the small hint). */
export function guessedShare(stat: Pick<SkillStat, 'total' | 'guessedRight'> | undefined): number {
  if (!stat || !stat.total) return 0
  return (stat.guessedRight || 0) / stat.total
}

export function applyConfidence(
  previous: SkillStat,
  correct: boolean,
  confidence: Confidence,
): SkillStat {
  return {
    ...previous,
    guessedRight: (previous.guessedRight || 0) + (correct && confidence === 'guessed' ? 1 : 0),
    understoodWrong: (previous.understoodWrong || 0) + (!correct && confidence === 'understood' ? 1 : 0),
  }
}

/** A misunderstanding comes back tomorrow, no later. */
export function misunderstoodReviewAt(now = Date.now()) {
  return now + MISSED_AGAIN_DAYS * DAY_MS
}
