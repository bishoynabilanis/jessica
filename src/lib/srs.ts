import type { SRSCard } from '@/types'

export const DAY_MS = 86_400_000
export type Grade = 'again' | 'hard' | 'good' | 'easy'

/**
 * SM-2 inspired scheduler with learning steps.
 * Intervals are stored in days. "Again" cards come back in 10 minutes.
 */
export function scheduleCard(card: SRSCard, grade: Grade): SRSCard {
  const now = Date.now()
  let { interval, ease, reps, lapses } = card
  let due = now

  if (grade === 'again') {
    reps = 0
    lapses += 1
    ease = Math.max(1.3, ease - 0.2)
    interval = 10 / (60 * 24)
    due = now + 10 * 60 * 1000
  } else if (grade === 'hard') {
    reps += 1
    ease = Math.max(1.3, ease - 0.15)
    interval = Math.max(1, interval * 1.2)
    due = now + interval * DAY_MS
  } else if (grade === 'good') {
    reps += 1
    interval = reps === 1 ? 1 : reps === 2 ? 3 : Math.max(1, interval * ease)
    due = now + interval * DAY_MS
  } else {
    reps += 1
    ease = Math.min(3.2, ease + 0.15)
    interval = Math.max(2, (interval || 1) * ease * 1.3)
    due = now + interval * DAY_MS
  }

  return {
    ...card,
    interval,
    ease,
    reps,
    lapses,
    due,
    lastReviewed: now,
  }
}

export function newCard(params: {
  bookId: string
  subject: string
  front: string
  back: string
  source?: string
}): SRSCard {
  return {
    id: `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    bookId: params.bookId,
    subject: params.subject,
    front: params.front,
    back: params.back,
    source: params.source || '',
    createdAt: Date.now(),
    due: Date.now(),
    interval: 0,
    ease: 2.5,
    reps: 0,
    lapses: 0,
  }
}

export function retentionLabel(card: SRSCard) {
  if (card.reps === 0) return 'New'
  if (card.interval < 1) return 'Learning'
  if (card.interval < 7) return 'Young'
  return 'Mature'
}

export function dueLabel(due: number) {
  const diff = due - Date.now()
  if (diff <= 0) return 'Due now'
  const hours = diff / 3_600_000
  if (hours < 1) return `${Math.ceil(diff / 60_000)} min`
  if (hours < 24) return `${Math.round(hours)} h`
  return `${Math.round(hours / 24)} d`
}
