import type { Book, PageText } from '@/types'
import { chapterCacheGet, getPdfBytes } from '@/lib/db'
import { clozeQuiz, keyTerms } from '@/lib/lesson'
import { getStorageInfo } from '@/lib/storage'

/**
 * "Is this lesson ready without internet?"
 *
 * Everything the student studies from a book lives on the device: the PDF
 * bytes, the text of every page, the lessons cut from that text and the
 * practice questions built from the same sentences. This file checks each of
 * those pieces and says in plain words what is missing, before the internet
 * drops. Nothing here talks to a server.
 */

/** A page with fewer characters than this is a picture with no text yet. */
export const MIN_PAGE_CHARS = 20
/** A lesson needs at least this much text to be worth opening. */
export const MIN_LESSON_CHARS = 200

export type ReadyState = 'ready' | 'almost' | 'not-ready'

export interface UnitReadiness {
  id: string
  title: string
  startPage: number
  /** Text exists for this lesson. */
  lesson: boolean
  /** The offline practice check can be built for this lesson. */
  exercises: boolean
}

export interface ReadinessInput {
  hasFile: boolean
  chapterPages: PageText[] | null
  pageCount: number
  units: { id: string; title: string; startPage: number; endPage: number }[]
  persisted: boolean | null
  appCached: boolean | null
}

export interface Readiness {
  state: ReadyState
  fileSaved: boolean
  textSaved: boolean
  pagesWithText: number
  pageCount: number
  /** Pages that are pictures only; reading them works, studying them needs a scan. */
  emptyPages: number[]
  /** The part of emptyPages that sits inside a lesson, so a lesson is missing words. */
  emptyInLessons: number[]
  units: UnitReadiness[]
  lessonsReady: number
  exercisesReady: number
  persisted: boolean | null
  appCached: boolean | null
  /** What the student can do about it, in order. */
  fixes: ('save-text' | 'scan-pages' | 'add-file' | 'keep-storage')[]
}

export function assessReadiness(input: ReadinessInput): Readiness {
  const pages = input.chapterPages || []
  const byPage = new Map(pages.map((page) => [page.page, page.text || '']))
  const textSaved = pages.length > 0 && pages.some((page) => page.text.trim().length >= MIN_PAGE_CHARS)
  const pagesWithText = pages.filter((page) => page.text.trim().length >= MIN_PAGE_CHARS).length
  const emptyPages: number[] = []
  if (textSaved) {
    for (let n = 1; n <= input.pageCount; n++) {
      if ((byPage.get(n) || '').trim().length < MIN_PAGE_CHARS) emptyPages.push(n)
    }
  }

  const inLesson = (n: number) =>
    input.units.length
      ? input.units.some((unit) => n >= unit.startPage && n <= unit.endPage)
      : true
  const emptyInLessons = emptyPages.filter(inLesson)

  const units: UnitReadiness[] = input.units.map((unit) => {
    const slice = pages.filter((page) => page.page >= unit.startPage && page.page <= unit.endPage)
    const chars = slice.reduce((sum, page) => sum + page.text.trim().length, 0)
    const lesson = chars >= MIN_LESSON_CHARS
    const exercises = lesson && clozeQuiz(keyTerms(slice), 4).length > 0
    return { id: unit.id, title: unit.title, startPage: unit.startPage, lesson, exercises }
  })
  const lessonsReady = units.filter((unit) => unit.lesson).length
  const exercisesReady = units.filter((unit) => unit.exercises).length

  const fixes: Readiness['fixes'] = []
  if (!input.hasFile) fixes.push('add-file')
  else if (!textSaved) fixes.push('save-text')
  if (textSaved && emptyInLessons.length > 0) fixes.push('scan-pages')
  if (input.persisted === false) fixes.push('keep-storage')

  let state: ReadyState
  if (!input.hasFile || !textSaved) state = 'not-ready'
  else if (emptyInLessons.length > 0 || lessonsReady < units.length || exercisesReady < units.length) state = 'almost'
  else state = 'ready'

  return {
    state,
    fileSaved: input.hasFile,
    textSaved,
    pagesWithText,
    pageCount: input.pageCount,
    emptyPages,
    emptyInLessons,
    units,
    lessonsReady,
    exercisesReady,
    persisted: input.persisted,
    appCached: input.appCached,
    fixes,
  }
}

/** Turn a sorted page list into short ranges such as "3–5, 9". */
export function pageRanges(pages: number[]) {
  const out: string[] = []
  let start = 0
  let prev = 0
  for (const page of [...pages].sort((a, b) => a - b)) {
    if (!start) start = prev = page
    else if (page === prev + 1) prev = page
    else {
      out.push(start === prev ? `${start}` : `${start}–${prev}`)
      start = prev = page
    }
  }
  if (start) out.push(start === prev ? `${start}` : `${start}–${prev}`)
  return out
}

async function appIsCached() {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return null
  try {
    const registration = await navigator.serviceWorker.getRegistration()
    return !!registration?.active
  } catch {
    return null
  }
}

/** Read what is stored on this device for one book and assess it. */
export async function checkBookReadiness(book: Book): Promise<Readiness> {
  const [bytes, chapter, storage, appCached] = await Promise.all([
    getPdfBytes(book.id).catch(() => undefined),
    chapterCacheGet(book.id).catch(() => undefined),
    getStorageInfo(),
    appIsCached(),
  ])
  return assessReadiness({
    hasFile: !!bytes && bytes.length > 0,
    chapterPages: chapter?.pages || null,
    pageCount: book.pageCount,
    units: book.units || [],
    persisted: storage.supported ? storage.persisted : null,
    appCached,
  })
}
