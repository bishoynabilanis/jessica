import { bridgeKindOf, bridgeUnits, type BridgeKind, type BridgeUnit } from '@/lib/bridge'

/**
 * Find the lab's mistake: a short worked board of four lines, built on the
 * device from the kind of the unit (taken from its title in the Ministry
 * book). Exactly one line has a wrong number. The numbers are computed, so
 * nothing about the lesson is invented. A unit that is not about numbers
 * gets no board.
 */

export interface MistakeLine {
  text: string
  ok: boolean
  fixed: string
}

export interface MistakeRound {
  kind: BridgeKind
  lines: MistakeLine[]
}

export { bridgeKindOf as mistakeKindOf }
export const mistakeUnits = bridgeUnits
export type MistakeUnit = BridgeUnit

type Rng = () => number
const int = (rng: Rng, lo: number, hi: number) => lo + Math.floor(rng() * (hi - lo + 1))

function line(kind: BridgeKind, rng: Rng, wrong: boolean): MistakeLine {
  const bump = () => (rng() < 0.5 ? -1 : 1) * int(rng, 1, 3)
  if (kind === 'fractions') {
    const d = int(rng, 2, 5)
    const n = int(rng, 1, d - 1)
    const k = int(rng, 2, 3)
    const top = n * k
    const shown = wrong ? top + int(rng, 1, 2) : top
    return { text: `${n}/${d} = ${shown}/${d * k}`, ok: !wrong, fixed: `${n}/${d} = ${top}/${d * k}` }
  }
  if (kind === 'equation') {
    const x = int(rng, 2, 12)
    const a = int(rng, 2, 9)
    const shown = wrong ? x + a * (rng() < 0.5 ? 1 : 2) : x
    return { text: `x + ${a} = ${x + a}  →  x = ${shown}`, ok: !wrong, fixed: `x + ${a} = ${x + a}  →  x = ${x}` }
  }
  if (kind === 'times') {
    const a = int(rng, 2, 9)
    const b = int(rng, 2, 9)
    const shown = wrong ? a * b + (rng() < 0.5 ? a : -a) : a * b
    return { text: `${a} × ${b} = ${shown}`, ok: !wrong, fixed: `${a} × ${b} = ${a * b}` }
  }
  if (kind === 'jump') {
    const a = int(rng, 10, 40)
    const b = int(rng, 2, 9)
    const shown = wrong ? a + b + bump() : a + b
    return { text: `${a} + ${b} = ${shown}`, ok: !wrong, fixed: `${a} + ${b} = ${a + b}` }
  }
  const base = [20, 40, 50, 60, 80, 100, 200][int(rng, 0, 6)]
  const pc = [10, 25, 50][int(rng, 0, 2)]
  const real = (pc * base) / 100
  const shown = wrong ? real * 2 : real
  return { text: `${pc}% × ${base} = ${shown}`, ok: !wrong, fixed: `${pc}% × ${base} = ${real}` }
}

export function makeMistakeRound(kind: BridgeKind, rng: Rng = Math.random, count = 4): MistakeRound {
  const bad = int(rng, 0, count - 1)
  const lines: MistakeLine[] = []
  const seen = new Set<string>()
  let guard = 0
  while (lines.length < count && guard++ < 200) {
    const next = line(kind, rng, lines.length === bad)
    if (seen.has(next.fixed)) continue
    // a "wrong" line must really differ from the true one
    if (!next.ok && next.text === next.fixed) continue
    seen.add(next.fixed)
    lines.push(next)
  }
  return { kind, lines }
}
