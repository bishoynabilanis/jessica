import type { ChapterText } from '@/types'

/**
 * 60-second mental math race. The size of the numbers and the operations on
 * offer come only from the child's own Ministry math book unit: the numbers
 * printed in it and the operation words it uses. Nothing is invented for a
 * unit without text. Scores stay on this device.
 */

export type Op = 'add' | 'sub' | 'mul' | 'div'

export interface RaceQuestion {
  text: string
  answer: number
  op: Op
}

const EASTERN = '٠١٢٣٤٥٦٧٨٩'
const toWestern = (s: string) => s.replace(/[٠-٩]/g, (d) => String(EASTERN.indexOf(d)))

export interface BookRange {
  /** the usual biggest number in the unit */
  max: number
  ops: Op[]
}

const OP_WORDS: Array<[Op, RegExp]> = [
  ['add', /جمع|الجمع|يجمع|إضافة/],
  ['sub', /طرح|الطرح|يطرح/],
  ['mul', /ضرب|الضرب|حاصل/],
  ['div', /قسمة|القسمة|تقسيم|يقسم|قسم/],
]

function niceUp(n: number): number {
  if (n <= 10) return 10
  if (n <= 20) return 20
  if (n <= 100) return Math.ceil(n / 10) * 10
  return Math.min(1000, Math.ceil(n / 100) * 100)
}

/** Read the number range and the operations from a unit of the math book. */
export function bookRange(chapter: ChapterText | undefined, startPage: number, endPage: number): BookRange | null {
  if (!chapter) return null
  const text = toWestern(
    chapter.pages
      .filter((p) => p.page >= startPage && p.page <= endPage)
      .map((p) => p.text)
      .join(' '),
  )
  const nums = (text.match(/\d+/g) ?? []).map(Number).filter((n) => n >= 1 && n <= 1000)
  const ops = OP_WORDS.filter(([, re]) => re.test(text)).map(([op]) => op)
  if (nums.length < 3 || !ops.length) return null
  nums.sort((a, b) => a - b)
  const p90 = nums[Math.min(nums.length - 1, Math.floor(nums.length * 0.9))]
  return { max: niceUp(Math.max(p90, 5)), ops }
}

const rnd = (lo: number, hi: number, rng: () => number) => lo + Math.floor(rng() * (hi - lo + 1))

export function makeQuestion(op: Op, max: number, rng: () => number = Math.random): RaceQuestion {
  if (op === 'add') {
    const a = rnd(1, Math.max(1, max - 1), rng)
    const b = rnd(1, Math.max(1, max - a), rng)
    return { op, text: `${a} + ${b}`, answer: a + b }
  }
  if (op === 'sub') {
    const a = rnd(2, max, rng)
    const b = rnd(1, a - 1, rng)
    return { op, text: `${a} − ${b}`, answer: a - b }
  }
  const f = Math.min(12, Math.max(3, max))
  const a = rnd(2, f, rng)
  const b = rnd(2, f, rng)
  if (op === 'mul') return { op, text: `${a} × ${b}`, answer: a * b }
  return { op, text: `${a * b} ÷ ${a}`, answer: b }
}

/** The next round: missed questions come back first, then fresh ones, never the same twice in one round. */
export function nextRound(ops: Op[], max: number, missed: RaceQuestion[], size = 40, rng: () => number = Math.random): RaceQuestion[] {
  const round: RaceQuestion[] = missed.filter((q) => ops.includes(q.op)).slice(0, 6)
  const seen = new Set(round.map((q) => q.text))
  let guard = 0
  while (round.length < size && guard++ < size * 20) {
    const q = makeQuestion(ops[rnd(0, ops.length - 1, rng)], max, rng)
    if (seen.has(q.text)) continue
    seen.add(q.text)
    round.push(q)
  }
  return round
}

const KEY = 'jessica-mathrace-v1'

export interface RaceSave {
  best: Record<string, number>
  missed: RaceQuestion[]
}

export function loadRace(): RaceSave {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}')
    return { best: raw.best && typeof raw.best === 'object' ? raw.best : {}, missed: Array.isArray(raw.missed) ? raw.missed : [] }
  } catch {
    return { best: {}, missed: [] }
  }
}

export function saveRace(save: RaceSave) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ best: save.best, missed: save.missed.slice(0, 12) }))
  } catch {
    /* storage full or blocked: the race still works, it just does not remember */
  }
}
