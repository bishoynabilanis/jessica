import type { ChapterText } from '@/types'
import { MIN_PAGE_CHARS } from '@/lib/offlineReady'

/**
 * "Turn the picture lesson into text", many pages at once.
 *
 * The runner reads one page at a time, saves each page the moment it is read,
 * and can be paused between pages. Because every page is saved on its own, a
 * pause, a closed tab or a lost connection never throws away finished work:
 * the next run simply starts with the pages that still have no text.
 */

export type PageOutcome =
  | { page: number; status: 'done'; chars: number }
  | { page: number; status: 'blank' }
  | { page: number; status: 'failed'; reason: 'network' | 'read' }

export interface BatchResult {
  outcomes: PageOutcome[]
  paused: boolean
  /** Pages never reached because the run was paused. */
  remaining: number[]
}

export interface BatchOptions {
  pages: number[]
  recognize: (page: number) => Promise<string>
  save: (page: number, text: string) => Promise<void>
  shouldPause: () => boolean
  onStart?: (page: number) => void
  onPage?: (outcome: PageOutcome, index: number, total: number) => void
}

export function failureReason(error: unknown): 'network' | 'read' {
  const text = String((error as Error)?.message || error || '')
  return /fetch|network|import|load|worker|failed to|cdn|offline/i.test(text) ? 'network' : 'read'
}

export async function runBatchOcr(options: BatchOptions): Promise<BatchResult> {
  const outcomes: PageOutcome[] = []
  const pages = [...options.pages]
  for (let i = 0; i < pages.length; i++) {
    if (options.shouldPause()) return { outcomes, paused: true, remaining: pages.slice(i) }
    const page = pages[i]
    options.onStart?.(page)
    let outcome: PageOutcome
    try {
      const text = await options.recognize(page)
      if (text.length < MIN_PAGE_CHARS) {
        outcome = { page, status: 'blank' }
      } else {
        await options.save(page, text)
        outcome = { page, status: 'done', chars: text.length }
      }
    } catch (error) {
      outcome = { page, status: 'failed', reason: failureReason(error) }
    }
    outcomes.push(outcome)
    options.onPage?.(outcome, i + 1, pages.length)
  }
  return { outcomes, paused: false, remaining: [] }
}

/** Pages in the range that still have no readable text. */
export function pagesToScan(chapter: ChapterText | null | undefined, from: number, to: number) {
  if (!chapter) return []
  const lo = Math.min(from, to)
  const hi = Math.max(from, to)
  return chapter.pages
    .filter((p) => p.page >= lo && p.page <= hi && (p.text || '').trim().length < MIN_PAGE_CHARS)
    .map((p) => p.page)
    .sort((a, b) => a - b)
}

/** Put one scanned page into the chapter and rebuild the joined text. */
export function withPageText(chapter: ChapterText, page: number, text: string): ChapterText {
  const pages = chapter.pages.map((item) => (item.page === page ? { ...item, text } : item))
  return { ...chapter, pages, text: pages.map((item) => `[Page ${item.page}]\n${item.text}`).join('\n\n') }
}
