import type { ChapterText } from '@/types'

/**
 * Restore the lesson board: three or four sentences that really follow each
 * other on one page of the unit are shuffled, and the child puts them back
 * in the book's order. Sentences come from the book text only, so a unit
 * without a run of usable sentences gives no board.
 */

export interface BoardRound {
  page: number
  sentences: string[]
}

const usable = (s: string) => s.length >= 25 && s.length <= 160 && /[\u0600-\u06FF]/.test(s)

export function runsOf(text: string): string[][] {
  const all = text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!؟?۔])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
  const runs: string[][] = []
  let run: string[] = []
  for (const sentence of all) {
    if (usable(sentence)) run.push(sentence)
    else {
      if (run.length >= 3) runs.push(run)
      run = []
    }
  }
  if (run.length >= 3) runs.push(run)
  return runs
}

export function makeBoardRound(chapter: ChapterText | undefined, startPage: number, endPage: number, rng: () => number = Math.random): BoardRound | null {
  if (!chapter) return null
  const pool: BoardRound[] = []
  for (const p of chapter.pages) {
    if (p.page < startPage || p.page > endPage) continue
    for (const run of runsOf(p.text)) {
      for (let i = 0; i + 3 <= run.length; i += 4) pool.push({ page: p.page, sentences: run.slice(i, i + Math.min(4, run.length - i)) })
    }
  }
  const valid = pool.filter((r) => r.sentences.length >= 3 && new Set(r.sentences).size === r.sentences.length)
  if (!valid.length) return null
  return valid[Math.floor(rng() * valid.length)]
}
