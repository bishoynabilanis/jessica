import type { QuizQuestion } from '@/types'
import { decodeShare, encodeShare } from '@/lib/shareCode'
import { MAX_CODE_CHARS, MAX_JSON_BYTES, cleanId, cleanNumber, cleanQuestions } from '@/lib/sharedPayload'

export interface PackCard {
  front: string
  back: string
}

export interface AssignmentPayload {
  /** 1 = quiz only (old links), 2 = class pack: quiz plus study cards. */
  v: 1 | 2
  id: string
  grade?: number
  subject: string
  bookTitle: string
  unitTitle: string
  unitKey: string
  questions: QuizQuestion[]
  /** Study cards made from the unit's book pages. Absent on old links. */
  cards?: PackCard[]
  createdAt: number
}

export interface AssignmentResult {
  v: 1
  id: string
  name: string
  score: number
  total: number
  date: number
  answers?: (number | null)[]
}

function encodeBase64Url(str: string) {
  const bytes = new TextEncoder().encode(str)
  let binary = ''
  bytes.forEach((b) => (binary += String.fromCharCode(b)))
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function decodeBase64Url(str: string) {
  if (str.length > MAX_CODE_CHARS) throw new Error('link too long')
  const padded = str.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(padded + '==='.slice((padded.length + 3) % 4))
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
  if (bytes.length > MAX_JSON_BYTES) throw new Error('link too big')
  return new TextDecoder().decode(bytes)
}

/** Rebuild a received paper from plain fields only; null when nothing usable is left. */
export function cleanAssignment(raw: unknown): AssignmentPayload | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const questions = cleanQuestions(r.questions)
  if (!questions.length) return null
  const cards = cleanCards(r.cards, 40)
  const grade = typeof r.grade === 'number' ? cleanNumber(r.grade, 1, 12) : undefined
  return {
    v: r.v === 2 ? 2 : 1,
    id: cleanId(r.id) || 'shared',
    grade,
    subject: typeof r.subject === 'string' ? r.subject.slice(0, 80) : '',
    bookTitle: typeof r.bookTitle === 'string' ? r.bookTitle.slice(0, 160) : '',
    unitTitle: typeof r.unitTitle === 'string' ? r.unitTitle.slice(0, 160) : '',
    unitKey: typeof r.unitKey === 'string' ? r.unitKey.slice(0, 200) : '',
    questions,
    ...(cards.length ? { cards } : {}),
    createdAt: cleanNumber(r.createdAt, 0, 4e12, 0),
  }
}

export function encodeAssignment(payload: AssignmentPayload) {
  return encodeBase64Url(JSON.stringify(payload))
}

export function decodeAssignment(code: string): AssignmentPayload | null {
  try {
    return cleanAssignment(JSON.parse(decodeBase64Url(code)))
  } catch {
    return null
  }
}

export function encodeResult(result: AssignmentResult) {
  return encodeBase64Url(JSON.stringify(result))
}

export function decodeResult(code: string): AssignmentResult | null {
  try {
    const parsed = JSON.parse(decodeBase64Url(code)) as Record<string, unknown>
    if (!parsed || typeof parsed.score !== 'number') return null
    const total = cleanNumber(parsed.total, 0, 1000, 0)
    return {
      v: 1,
      id: cleanId(parsed.id) || 'shared',
      name: typeof parsed.name === 'string' ? parsed.name.slice(0, 60) : '',
      score: cleanNumber(parsed.score, 0, total || 1000, 0),
      total,
      date: cleanNumber(parsed.date, 0, 4e12, 0),
      answers: Array.isArray(parsed.answers)
        ? parsed.answers.slice(0, 60).map((a) => (typeof a === 'number' && Number.isInteger(a) && a >= 0 && a < 10 ? a : null))
        : undefined,
    }
  } catch {
    return null
  }
}

export function assignmentUrl(payload: AssignmentPayload) {
  return `${window.location.origin}${window.location.pathname}#/assign?d=${encodeAssignment(payload)}`
}

export function resultUrl(result: AssignmentResult) {
  return `${window.location.origin}${window.location.pathname}#/assign?r=${encodeResult(result)}`
}

/** Compressed pack code. About half the size of the old plain code, so it fits in a QR more often. */
export function encodePack(payload: AssignmentPayload) {
  return encodeShare(payload)
}

export function decodePack(code: string): AssignmentPayload | null {
  return cleanAssignment(decodeShare<unknown>(code))
}

/** Opens either kind of link: the new compressed `p=` or an old plain `d=`. */
export function decodeAnyAssignment(pack: string, plain: string): AssignmentPayload | null {
  if (pack) return decodePack(pack)
  return plain ? decodeAssignment(plain) : null
}

export function packUrl(payload: AssignmentPayload, base = `${window.location.origin}${window.location.pathname}`) {
  return `${base}#/assign?p=${encodePack(payload)}`
}

export interface PackFit {
  payload: AssignmentPayload
  link: string
  explanations: boolean
  droppedCards: number
  droppedQuestions: number
}

/**
 * Shrinks a pack until its link is at most `limit` characters. Order of
 * sacrifice: answer explanations, then study cards, then questions (never
 * below 4). Nothing is invented; only parts are left out.
 */
export function fitPack(full: AssignmentPayload, limit: number, base?: string): PackFit {
  const cards = full.cards || []
  const make = (explanations: boolean, nc: number, nq: number) => {
    const payload: AssignmentPayload = {
      ...full,
      v: 2,
      cards: cards.slice(0, nc),
      questions: full.questions.slice(0, nq).map((q) => (explanations ? q : { ...q, explanation: '' })),
    }
    return { payload, link: packUrl(payload, base), explanations }
  }
  const done = (r: { payload: AssignmentPayload; link: string; explanations: boolean }): PackFit => ({
    ...r,
    droppedCards: cards.length - (r.payload.cards?.length || 0),
    droppedQuestions: full.questions.length - r.payload.questions.length,
  })
  let last = make(true, cards.length, full.questions.length)
  if (last.link.length <= limit) return done(last)
  last = make(false, cards.length, full.questions.length)
  if (last.link.length <= limit) return done(last)
  for (let nc = cards.length - 1; nc >= 0; nc -= 1) {
    last = make(false, nc, full.questions.length)
    if (last.link.length <= limit) return done(last)
  }
  for (let nq = full.questions.length - 1; nq >= Math.min(4, full.questions.length); nq -= 1) {
    last = make(false, 0, nq)
    if (last.link.length <= limit) return done(last)
  }
  return done(last)
}

/** Longest link a QR code (error correction L) can hold with some safety margin. */
export const QR_LINK_LIMIT = 2600
/** Longest link we are happy to paste into a chat. */
export const CHAT_LINK_LIMIT = 8000

/** Added to the flashcard prompt so every card comes from the unit's own pages. */
export const PACK_CARD_RULE =
  'Use ONLY facts written in the textbook pages above. Do not add outside facts. Keep each front under 100 characters and each back under 180 characters.'

export function cleanCards(raw: unknown, max: number): PackCard[] {
  if (!Array.isArray(raw)) return []
  return (raw as { front?: unknown; back?: unknown }[])
    .map((item) => ({
      front: typeof item?.front === 'string' ? item.front.replace(/\s+/g, ' ').trim().slice(0, 140) : '',
      back: typeof item?.back === 'string' ? item.back.replace(/\s+/g, ' ').trim().slice(0, 220) : '',
    }))
    .filter((card) => card.front && card.back)
    .slice(0, max)
}
