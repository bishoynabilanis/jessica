import type { Book, BookUnit } from '@/types'
import { labForUnit } from '@/lib/lessonLab'

/**
 * Bridge rescue: each gap on the bridge needs a plank with the right value.
 * Rounds are built on the device from the kind of the unit (taken from its
 * title in the Ministry book). A unit that is not about numbers gets no round.
 */

export type BridgeKind = 'fractions' | 'equation' | 'times' | 'jump' | 'percent'

export interface BridgeGap {
  prompt: string
  answer: string
}

export interface BridgeRound {
  kind: BridgeKind
  gaps: BridgeGap[]
  planks: string[]
}

const LAB_TO_KIND: Record<string, BridgeKind> = {
  fractions: 'fractions',
  balance: 'equation',
  times: 'times',
  numberline: 'jump',
  percent: 'percent',
}

export function bridgeKindOf(unit: Pick<BookUnit, 'title'>): BridgeKind | null {
  const lab = labForUnit(unit)
  return lab ? LAB_TO_KIND[lab] ?? null : null
}

export interface BridgeUnit {
  book: Book
  unit: BookUnit
  kind: BridgeKind
}

export function bridgeUnits(books: Book[]): BridgeUnit[] {
  const out: BridgeUnit[] = []
  for (const book of books) {
    for (const unit of book.units || []) {
      const kind = bridgeKindOf(unit)
      if (kind) out.push({ book, unit, kind })
    }
  }
  return out
}

type Rng = () => number
const int = (rng: Rng, lo: number, hi: number) => lo + Math.floor(rng() * (hi - lo + 1))

function shuffled<T>(rng: Rng, list: T[]) {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function uniqueNumbers(rng: Rng, avoid: number[], count: number, lo: number, hi: number) {
  const out: number[] = []
  let guard = 0
  while (out.length < count && guard++ < 200) {
    const v = int(rng, lo, hi)
    if (!avoid.includes(v) && !out.includes(v)) out.push(v)
  }
  return out
}

function gapsFor(kind: BridgeKind, rng: Rng, count: number): BridgeGap[] {
  const gaps: BridgeGap[] = []
  const used = new Set<string>()
  let guard = 0
  while (gaps.length < count && guard++ < 100) {
    let gap: BridgeGap
    if (kind === 'fractions') {
      const d = int(rng, 2, 5)
      const n = int(rng, 1, d - 1)
      const k = int(rng, 2, 3)
      gap = { prompt: `${n}/${d} = ?/${d * k}`, answer: String(n * k) }
    } else if (kind === 'equation') {
      const x = int(rng, 2, 12)
      const a = int(rng, 2, 9)
      gap = rng() < 0.5 ? { prompt: `x + ${a} = ${x + a}`, answer: String(x) } : { prompt: `x - ${a} = ${x - a}`, answer: String(x) }
      if (x - a < 0 && gap.prompt.startsWith('x -')) continue
    } else if (kind === 'times') {
      const a = int(rng, 2, 9)
      const b = int(rng, 2, 9)
      gap = { prompt: `${a} × ${b} = ?`, answer: String(a * b) }
    } else if (kind === 'jump') {
      const a = int(rng, 5, 40)
      const b = int(rng, 2, 9)
      gap = rng() < 0.5 ? { prompt: `${a} + ${b} = ?`, answer: String(a + b) } : { prompt: `${a + b} - ${b} = ?`, answer: String(a) }
    } else {
      const base = [20, 40, 50, 60, 80, 100, 200][int(rng, 0, 6)]
      const pc = [10, 25, 50][int(rng, 0, 2)]
      gap = { prompt: `${pc}% × ${base} = ?`, answer: String((pc * base) / 100) }
    }
    if (used.has(gap.prompt)) continue
    used.add(gap.prompt)
    gaps.push(gap)
  }
  return gaps
}

export function makeBridgeRound(kind: BridgeKind, rng: Rng = Math.random, count = 4): BridgeRound {
  const gaps = gapsFor(kind, rng, count)
  const answers = gaps.map((g) => g.answer)
  const nums = answers.map(Number)
  const spare = uniqueNumbers(rng, nums, 2, Math.max(1, Math.min(...nums) - 3), Math.max(...nums) + 6).map(String)
  return { kind, gaps, planks: shuffled(rng, [...answers, ...spare]) }
}

/** Gentle hint for a wrong plank. It never says the answer. */
export function bridgeHint(kind: BridgeKind): string {
  switch (kind) {
    case 'fractions':
      return 'Multiply the top and the bottom by the same number.'
    case 'equation':
      return 'Do the opposite operation on both sides.'
    case 'times':
      return 'Count in jumps of the first number.'
    case 'jump':
      return 'Jump on the number line, forward to add and back to subtract.'
    default:
      return 'Half is 50%, a quarter is 25%, a tenth is 10%.'
  }
}
