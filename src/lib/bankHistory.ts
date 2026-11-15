import type { BankSubject } from './questionBank'

/**
 * Exam history: every marked paper, on the device, so the student (and the
 * parent) can see a score move instead of guessing.
 */

export interface BankAttempt {
  id: string
  at: number
  subject: BankSubject
  mode: 'drill' | 'exam' | 'mistakes'
  score: number
  total: number
  seconds: number
}

const KEY = 'jessica-bank-attempts-v1'
const LIMIT = 40

export function readAttempts(): BankAttempt[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((item) => item && typeof item.score === 'number' && typeof item.total === 'number')
      .slice(0, LIMIT)
  } catch {
    return []
  }
}

export function addAttempt(entry: Omit<BankAttempt, 'id' | 'at'>): BankAttempt[] {
  const attempt: BankAttempt = {
    ...entry,
    id: `a_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    at: Date.now(),
  }
  const next = [attempt, ...readAttempts()].slice(0, LIMIT)
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* private mode, the paper still counts for this session */
  }
  return next
}

/** The previous attempt on the same subject and mode, for the delta line. */
export function previousAttempt(subject: BankSubject, mode: 'drill' | 'exam' | 'mistakes'): BankAttempt | null {
  return readAttempts().find((item) => item.subject === subject && item.mode === mode) || null
}
