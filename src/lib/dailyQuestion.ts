import type { Book, GradeLevel, QuizQuestion } from '@/types'
import type { StoredQuiz } from '@/lib/db'
import { buildDrill, toBankSubject, type BankSubject } from '@/lib/questionBank'

const FALLBACK_SUBJECTS = ['Mathematics', 'Science', 'English', 'Arabic', 'Social Studies', 'ICT'] as const satisfies readonly BankSubject[]

/**
 * One curriculum question a day, chosen on the device. It comes from the
 * questions already saved for the student's own Ministry books. A book that
 * did not come from the Ministry catalogue is never used. With no saved book
 * questions yet, it falls back to a grade skill question from the offline
 * bank and says so. Nothing is sent anywhere and nothing personal is stored.
 */

export interface DailySource {
  kind: 'book' | 'bank'
  subject: string
  bookTitle?: string
}

export interface DailyQuestion {
  date: string
  question: QuizQuestion
  source: DailySource
}

export interface DailyState {
  today?: DailyQuestion & { picked?: number }
  /** date -> true when the first answer was right. Only the last 60 days are kept. */
  history: Record<string, boolean>
}

const KEY = 'jessica-daily-question-v1'

export function hashSeed(text: string): number {
  let h = 2166136261
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function profileId(): string {
  try {
    const registry = JSON.parse(window.localStorage.getItem('jessica-profiles-v1') || '{}') as { active?: string }
    return registry.active || 'main'
  } catch {
    return 'main'
  }
}

const storageKey = () => `${KEY}:${profileId()}`

export function loadDaily(): DailyState {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(storageKey()) || '{}') as Partial<DailyState>
    return { today: parsed.today, history: parsed.history && typeof parsed.history === 'object' ? parsed.history : {} }
  } catch {
    return { history: {} }
  }
}

export function saveDaily(state: DailyState) {
  const days = Object.keys(state.history).sort()
  const history = Object.fromEntries(days.slice(-60).map((day) => [day, state.history[day]]))
  try {
    window.localStorage.setItem(storageKey(), JSON.stringify({ ...state, history }))
  } catch {
    // Storage blocked or full: today's question just does not persist.
  }
}

const valid = (q: QuizQuestion) =>
  !!q?.question && Array.isArray(q.options) && q.options.length === 4 && Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4

/** Every saved question from the student's Ministry catalogue books. */
export function bookPool(quizzes: StoredQuiz[], books: Book[]): { question: QuizQuestion; source: DailySource }[] {
  const ministry = new Map(books.filter((book) => book.catalogId).map((book) => [book.id, book]))
  const pool: { question: QuizQuestion; source: DailySource }[] = []
  for (const quiz of quizzes) {
    const book = quiz.bookId ? ministry.get(quiz.bookId) : undefined
    if (!book) continue
    for (const question of quiz.questions || []) {
      if (valid(question)) pool.push({ question, source: { kind: 'book', subject: book.subject, bookTitle: book.title } })
    }
  }
  return pool
}

/** The same question all day for the same pool, a different one tomorrow. */
export function chooseDaily(
  date: string,
  quizzes: StoredQuiz[],
  books: Book[],
  grade: GradeLevel,
  preferredSubject?: string,
): DailyQuestion | null {
  const pool = bookPool(quizzes, books).sort((a, b) => a.question.question.localeCompare(b.question.question))
  if (pool.length) {
    const hit = pool[hashSeed(date) % pool.length]
    return { date, ...hit }
  }
  const preferred = preferredSubject ? toBankSubject(preferredSubject) : undefined
  const subject: BankSubject =
    preferred && (FALLBACK_SUBJECTS as readonly string[]).includes(preferred)
      ? preferred
      : FALLBACK_SUBJECTS[hashSeed(date) % FALLBACK_SUBJECTS.length]
  const drill = buildDrill(subject, grade, 1)[0]
  if (!drill) return null
  return {
    date,
    question: {
      question: drill.prompt,
      options: drill.options,
      answer: drill.answer,
      explanation: drill.explanation,
      topic: drill.skill,
    },
    source: { kind: 'bank', subject },
  }
}

/** Days in a row, ending today or yesterday, with an answer given. */
export function dailyStreak(history: Record<string, boolean>, today: string): number {
  const day = (offset: number) => {
    const d = new Date(`${today}T12:00:00`)
    d.setDate(d.getDate() - offset)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }
  let offset = day(0) in history ? 0 : 1
  let count = 0
  while (day(offset) in history) {
    count += 1
    offset += 1
  }
  return count
}
