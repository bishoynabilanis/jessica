/**
 * Mastery points for one lesson, worked out from what the child already did.
 * Nothing new is stored: it reads the best quiz score and the topics they missed.
 */
export type MasteryLevel = 'none' | 'warming' | 'growing' | 'strong' | 'mastered'

export interface LessonMastery {
  /** 0-100, the best quiz score for this lesson. */
  points: number
  level: MasteryLevel
  /** The concept missed most often, if any. */
  weakest?: string
  attempts: number
}

interface Stat {
  best: number
  total: number
  attempts?: number
  weak?: Record<string, number>
}

export function lessonMastery(stat: Stat | undefined, completed = false): LessonMastery {
  if (!stat || !stat.total) {
    return { points: completed ? 80 : 0, level: completed ? 'mastered' : 'none', attempts: 0 }
  }
  const points = Math.max(0, Math.min(100, Math.round((stat.best / stat.total) * 100)))
  const level: MasteryLevel =
    completed || points >= 80 ? 'mastered' : points >= 60 ? 'strong' : points >= 30 ? 'growing' : 'warming'
  const weakEntries = Object.entries(stat.weak || {}).sort((a, b) => b[1] - a[1])
  const weakest = level === 'mastered' ? undefined : weakEntries[0]?.[0]
  return { points, level, weakest, attempts: stat.attempts || 0 }
}

export const MASTERY_LABEL: Record<MasteryLevel, string> = {
  none: 'Not started',
  warming: 'Warming up',
  growing: 'Getting there',
  strong: 'Almost there',
  mastered: 'Mastered',
}
