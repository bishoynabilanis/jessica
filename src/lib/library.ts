import type { Book, ChapterText } from '@/types'
import { chapterCacheGet, getPdfBytes } from '@/lib/db'
import { extractChapter } from '@/lib/pdf'

/**
 * Read a book's extracted text, building it from the locally stored PDF when
 * the cache is cold. Used by tools that do not render the PDF viewer.
 */
export async function openChapter(book: Book): Promise<ChapterText | undefined> {
  const cached = await chapterCacheGet(book.id)
  if (cached?.text?.trim()) return cached

  const bytes = await getPdfBytes(book.id)
  if (!bytes) return undefined

  const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: 'application/pdf' }))
  try {
    return await extractChapter(url, book.id)
  } finally {
    URL.revokeObjectURL(url)
  }
}
