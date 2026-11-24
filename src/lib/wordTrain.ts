import type { ChapterText } from '@/types'
import { splitSentences } from '@/lib/detective'

/**
 * Word train: one real sentence from the unit text, cut into word cars.
 * The child puts the cars back in order. The sentence is the book's own,
 * so a unit with no usable text gives no train.
 */

export interface TrainRound {
  page: number
  words: string[]
  sentence: string
}

const words = (s: string) => s.split(/\s+/).filter(Boolean)

export function makeTrainRound(chapter: ChapterText | undefined, startPage: number, endPage: number, rng: () => number = Math.random): TrainRound | null {
  if (!chapter) return null
  const pool: Array<{ page: number; sentence: string }> = []
  for (const p of chapter.pages) {
    if (p.page < startPage || p.page > endPage) continue
    for (const sentence of splitSentences(p.text)) {
      const n = words(sentence).length
      if (n >= 4 && n <= 8) pool.push({ page: p.page, sentence })
    }
  }
  if (!pool.length) return null
  const pick = pool[Math.floor(rng() * pool.length)]
  return { page: pick.page, sentence: pick.sentence, words: words(pick.sentence) }
}

/** A shuffled order of indexes that is never already the right order. */
export function shuffledOrder(n: number, rng: () => number = Math.random): number[] {
  const order = Array.from({ length: n }, (_, i) => i)
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  if (n > 1 && order.every((v, i) => v === i)) order.reverse()
  return order
}
