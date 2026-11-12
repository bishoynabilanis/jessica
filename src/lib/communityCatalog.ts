import type { GradeLevel, LanguageCode, Subject } from '@/types'
import type { OfficialBook } from '@/data/officialBooks'

const SUBJECTS: Subject[] = [
  'English',
  'Arabic',
  'German',
  'French',
  'Science',
  'Mathematics',
  'Social Studies',
  'Religion',
]

const LANGUAGES: LanguageCode[] = ['en', 'ar', 'de', 'fr']

export interface CommunityCatalogResult {
  books: OfficialBook[]
  skipped: number
}

function isUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

/** Validates a shared catalog file (array or { books: [] }) into book entries. */
export function parseCommunityCatalog(raw: unknown): CommunityCatalogResult {
  const list = Array.isArray(raw)
    ? raw
    : raw && typeof raw === 'object' && Array.isArray((raw as { books?: unknown[] }).books)
      ? (raw as { books: unknown[] }).books
      : []

  const books: OfficialBook[] = []
  let skipped = 0

  for (const item of list.slice(0, 300)) {
    const entry = item as Record<string, unknown>
    const grade = Number(entry.grade)
    const subject = entry.subject as Subject
    const term = entry.term === 'Term 2' ? 'Term 2' : 'Term 1'
    const title = typeof entry.title === 'string' ? entry.title.trim().slice(0, 120) : ''
    const url = entry.url

    if (
      !title ||
      !isUrl(url) ||
      !Number.isInteger(grade) ||
      grade < 1 ||
      grade > 9 ||
      !SUBJECTS.includes(subject)
    ) {
      skipped += 1
      continue
    }

    const language = LANGUAGES.includes(entry.language as LanguageCode)
      ? (entry.language as LanguageCode)
      : subject === 'Arabic' || subject === 'Religion'
        ? 'ar'
        : 'en'

    books.push({
      id:
        typeof entry.id === 'string' && entry.id.startsWith('community-')
          ? entry.id
          : `community-${hash(url)}`,
      grade: grade as GradeLevel,
      subject,
      term,
      title,
      url,
      sizeMb: Number.isFinite(Number(entry.sizeMb)) ? Number(entry.sizeMb) : 0,
      language,
      community: true,
    })
  }

  return { books: dedupe(books), skipped }
}

function hash(value: string) {
  let result = 0
  for (let index = 0; index < value.length; index += 1) {
    result = (result * 31 + value.charCodeAt(index)) >>> 0
  }
  return result.toString(36)
}

export function dedupe(books: OfficialBook[]) {
  const seen = new Set<string>()
  return books.filter((book) => {
    const key = `${book.url}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function catalogTemplate() {
  return JSON.stringify(
    {
      name: 'My school catalog',
      books: [
        {
          title: 'Science — First Preparatory',
          grade: 7,
          subject: 'Science',
          term: 'Term 1',
          language: 'en',
          url: 'https://example.com/science-prep1-term1.pdf',
          sizeMb: 24,
        },
        {
          title: 'اللغة العربية — الصف الأول الإعدادي',
          grade: 7,
          subject: 'Arabic',
          term: 'Term 1',
          language: 'ar',
          url: 'https://example.com/arabic-prep1-term1.pdf',
          sizeMb: 30,
        },
      ],
    },
    null,
    2,
  )
}
