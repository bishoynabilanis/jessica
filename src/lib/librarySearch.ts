import { chapterCacheGet } from '@/lib/db'
import type { Book } from '@/types'

export interface Passage {
  id: string
  bookId: string
  bookTitle: string
  subject: string
  page: number
  text: string
}

interface IndexedPassage extends Passage {
  norm: string
  tokens: string[]
}

const STOP = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'what', 'when', 'where', 'which', 'how',
  'are', 'was', 'were', 'you', 'your', 'his', 'her', 'its', 'not', 'but', 'all', 'can', 'will',
  'في', 'من', 'على', 'عن', 'الى', 'إلى', 'هو', 'هي', 'هم', 'ان', 'أن', 'ال', 'و', 'او', 'أو',
  'ما', 'ماذا', 'لماذا', 'كيف', 'اين', 'أين', 'هذا', 'هذه', 'ذلك', 'التي', 'الذي', 'مع', 'كل',
])

function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/[\u064B-\u0652\u0670\u0640]/g, '')
    .replace(/[إأآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function tokenize(text: string) {
  return normalize(text)
    .split(' ')
    .filter((token) => token.length > 1 && !STOP.has(token))
}

let cache: { key: string; entries: IndexedPassage[] } | null = null
let pending: { key: string; promise: Promise<IndexedPassage[]> } | null = null

/**
 * Index every cached book page into overlapping passages.
 * The index is rebuilt only when the set of books changes.
 */
export async function buildLibraryIndex(books: Book[]): Promise<IndexedPassage[]> {
  const key = books
    .map((book) => `${book.id}:${book.pageCount}`)
    .sort()
    .join('|')
  if (cache?.key === key) return cache.entries
  if (pending?.key === key) return pending.promise

  const promise = (async () => {
    const entries: IndexedPassage[] = []
    for (const book of books) {
      const chapter = await chapterCacheGet(book.id)
      if (!chapter) continue
      for (const page of chapter.pages) {
        const text = page.text.replace(/\s+/g, ' ').trim()
        if (text.length < 40) continue
        for (let start = 0; start < text.length; start += 850) {
          const slice = text.slice(start, start + 1050).trim()
          if (slice.length < 60) continue
          entries.push({
            id: `${book.id}-${page.page}-${start}`,
            bookId: book.id,
            bookTitle: book.title,
            subject: book.subject,
            page: page.page,
            text: slice,
            norm: normalize(slice),
            tokens: tokenize(slice),
          })
        }
      }
    }
    cache = { key, entries }
    return entries
  })()

  pending = { key, promise }
  try {
    return await promise
  } finally {
    pending = null
  }
}

export function searchLibrary(entries: IndexedPassage[], query: string, limit = 8): Passage[] {
  const terms = tokenize(query)
  if (!terms.length) return []

  const scored = entries
    .map((entry) => {
      let score = 0
      for (const term of terms) {
        let hits = 0
        for (const token of entry.tokens) if (token === term) hits += 1
        if (hits) score += 1 + Math.log(hits)
        else if (entry.norm.includes(term)) score += 0.35
      }
      return { entry, score }
    })
    .filter((item) => item.score > 0.5)
    .sort((a, b) => b.score - a.score)

  const seen = new Set<string>()
  const results: Passage[] = []
  for (const { entry } of scored) {
    const key = `${entry.bookId}:${entry.page}`
    if (seen.has(key)) continue
    seen.add(key)
    const { norm: _norm, tokens: _tokens, ...passage } = entry
    results.push(passage)
    if (results.length >= limit) break
  }
  return results
}

export function scoreText(text: string, query: string) {
  const terms = tokenize(query)
  if (!terms.length) return 0
  const norm = normalize(text)
  let score = 0
  for (const term of terms) {
    let index = norm.indexOf(term)
    let hits = 0
    while (index !== -1 && hits < 20) {
      hits += 1
      index = norm.indexOf(term, index + term.length)
    }
    if (hits) score += 1 + Math.log(hits)
  }
  return score
}
