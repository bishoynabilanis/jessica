import type { Book, BookUnit } from '@/types'
import { deleteChapterCache, getPdfBytes, savePdfBytes } from '@/lib/db'
import { detectFromFilename } from '@/lib/importBook'
import { ministryEntryFor } from '@/lib/bookCheck'
import { detectUnits } from '@/lib/units'

/**
 * Put a different file under an existing book without losing the student's
 * progress. The book keeps its id, so reading position, highlights, notes,
 * bookmarks and flashcards stay attached. Lessons keep their ids when the new
 * edition has a lesson with the same title, so finished lessons stay finished.
 */

const MAX_BYTES = 150 * 1024 * 1024
const norm = (title: string) => title.replace(/\s+/g, ' ').trim().toLowerCase()

export interface SwapResult {
  book: Book
  pageCount: number
  /** Lessons that kept their id, so their progress carried over. */
  keptLessons: number
  newLessons: number
  droppedLessons: number
  lastPage: number
}

/** Carry old lesson ids onto the new list wherever the titles match. */
export function mapUnitIds(oldUnits: BookUnit[], fresh: BookUnit[], stamp = Date.now().toString(36)) {
  const pool = new Map<string, BookUnit[]>()
  for (const unit of oldUnits) {
    const key = norm(unit.title)
    pool.set(key, [...(pool.get(key) || []), unit])
  }
  const taken = new Set<string>()
  let kept = 0
  const units = fresh.map((unit, index) => {
    const match = (pool.get(norm(unit.title)) || []).find((old) => !taken.has(old.id))
    if (match) {
      taken.add(match.id)
      kept += 1
      return { ...unit, id: match.id }
    }
    // A fresh id that cannot collide with an old lesson's progress.
    return { ...unit, id: `ed-${stamp}-${index + 1}` }
  })
  return { units, kept, dropped: oldUnits.length - kept }
}

/** Why a file should not replace this book, or null when it can. */
export function swapProblem(book: Book, file: File): 'not-pdf' | 'too-big' | 'other-grade' | 'other-subject' | null {
  if (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name)) return 'not-pdf'
  if (file.size > MAX_BYTES) return 'too-big'
  const detected = detectFromFilename(file.name)
  if (detected.grade && book.grade && detected.grade !== book.grade) return 'other-grade'
  if (detected.subject && detected.subject !== book.subject) return 'other-subject'
  return null
}

export async function swapBookFile(
  book: Book,
  file: File,
  lastPage: number,
  onProgress?: (page: number, total: number) => void,
): Promise<SwapResult> {
  const previous = await getPdfBytes(book.id)
  try {
    const bytes = new Uint8Array(await file.arrayBuffer())
    await savePdfBytes(book.id, bytes)
    await deleteChapterCache(book.id)
    const { extractChapterFromBytes } = await import('@/lib/pdf')
    const chapter = await extractChapterFromBytes(bytes, book.id, onProgress)
    const pageCount = chapter.pages.length
    const mapped = mapUnitIds(book.units || [], detectUnits(chapter.pages, pageCount))
    const entry = ministryEntryFor(book)
    const next: Book = {
      ...book,
      pageCount,
      units: mapped.units,
      sizeMb: Number((file.size / (1024 * 1024)).toFixed(1)),
      sourceUrl: entry && entry.id === book.catalogId ? entry.url : book.sourceUrl,
    }
    return {
      book: next,
      pageCount,
      keptLessons: mapped.kept,
      newLessons: mapped.units.length - mapped.kept,
      droppedLessons: mapped.dropped,
      lastPage: Math.max(1, Math.min(lastPage || 1, pageCount)),
    }
  } catch (error) {
    // Put the old file back so a failed swap changes nothing.
    if (previous) await savePdfBytes(book.id, previous)
    await deleteChapterCache(book.id)
    throw error
  }
}
