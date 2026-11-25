import type { ChapterText } from '@/types'

/**
 * Finger tracing: the letters, words and numbers to trace come only from the
 * child's own book unit. Nothing is drawn from a built-in list.
 */

export type TraceKind = 'letters' | 'words' | 'numbers'

const LETTER = /[\u0621-\u064A]/g
const WORD = /[\u0621-\u064A]+/g
const NUMBER = /[0-9\u0660-\u0669]+/g

function unitText(chapter: ChapterText | undefined, startPage: number, endPage: number): string {
  if (!chapter) return ''
  return chapter.pages
    .filter((p) => p.page >= startPage && p.page <= endPage)
    .map((p) => p.text)
    .join(' ')
}

const unique = (list: string[], max: number) => Array.from(new Set(list)).slice(0, max)

export function traceItems(chapter: ChapterText | undefined, startPage: number, endPage: number, max = 12): Record<TraceKind, string[]> {
  const text = unitText(chapter, startPage, endPage)
  return {
    letters: unique(text.match(LETTER) ?? [], max),
    words: unique((text.match(WORD) ?? []).filter((w) => w.length >= 2 && w.length <= 5), max),
    numbers: unique((text.match(NUMBER) ?? []).filter((n) => n.length <= 3), max),
  }
}

export interface TraceScore {
  covered: number
  spill: number
  ok: boolean
}

/**
 * Compare the child's strokes with the shape. Both are alpha masks of the same
 * size. `guide` is the shape, `wide` is the shape grown a little (room for a
 * thick finger line). The child passes when the strokes cover most of the shape
 * and do not wander far from it. This checks the shape, not the stroke order.
 */
export function scoreTrace(guide: Uint8Array, wide: Uint8Array, drawn: Uint8Array): TraceScore {
  let g = 0
  let hit = 0
  let d = 0
  let out = 0
  for (let i = 0; i < guide.length; i++) {
    if (guide[i]) {
      g++
      if (drawn[i]) hit++
    }
    if (drawn[i]) {
      d++
      if (!wide[i]) out++
    }
  }
  const covered = g ? hit / g : 0
  const spill = d ? out / d : 1
  return { covered, spill, ok: g > 0 && d > 0 && covered >= 0.75 && spill <= 0.3 }
}
