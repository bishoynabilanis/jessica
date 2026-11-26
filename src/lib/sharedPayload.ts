import type { QuizQuestion } from '@/types'

/**
 * Links people open can come from anyone, so everything inside them is treated
 * as untrusted: capped in size and count, and rebuilt field by field from plain
 * strings and numbers. Nothing from a link is ever used as markup.
 */
export const MAX_CODE_CHARS = 60_000
export const MAX_JSON_BYTES = 400_000
export const MAX_QUESTIONS = 60
export const MAX_OPTIONS = 6

function text(value: unknown, max: number): string {
  return typeof value === 'string' ? value.slice(0, max) : ''
}

export function cleanQuestions(raw: unknown): QuizQuestion[] {
  if (!Array.isArray(raw)) return []
  const out: QuizQuestion[] = []
  for (const item of raw.slice(0, MAX_QUESTIONS * 2)) {
    if (out.length >= MAX_QUESTIONS) break
    if (!item || typeof item !== 'object') continue
    const q = item as Record<string, unknown>
    const options = Array.isArray(q.options) ? q.options.slice(0, MAX_OPTIONS).map((o) => text(o, 300)) : []
    const answer = typeof q.answer === 'number' && Number.isInteger(q.answer) ? q.answer : -1
    const question = text(q.question, 600)
    if (!question || options.length < 2 || answer < 0 || answer >= options.length) continue
    const difficulty = q.difficulty === 'easy' || q.difficulty === 'medium' || q.difficulty === 'hard' ? q.difficulty : undefined
    out.push({ question, options, answer, explanation: text(q.explanation, 800), topic: text(q.topic, 120) || undefined, difficulty })
  }
  return out
}

export function cleanId(value: unknown): string {
  return text(value, 80).replace(/[^\w.-]/g, '')
}

export function cleanNumber(value: unknown, min: number, max: number, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback
}
