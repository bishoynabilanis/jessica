import type { Book, LanguageCode, Subject } from '@/types'
import { subjectMeta } from '@/data/books'
import { officialBooks, type OfficialBook } from '@/data/officialBooks'
import { deleteChapterCache, deletePdfBytes, savePdfBytes } from '@/lib/db'
import { extractChapterFromBytes } from '@/lib/pdf'
import { detectUnits } from '@/lib/units'

export const SUBJECTS: Subject[] = ['English', 'Arabic', 'German', 'French', 'Science', 'Mathematics', 'Social Studies']

export interface ImportMeta {
  title: string
  subject: Subject
  term: 'Term 1' | 'Term 2'
  grade: 1 | 2 | 3 | 4
  catalog?: OfficialBook | null
}

export function languageFor(subject: Subject): LanguageCode {
  const lang = subjectMeta[subject]?.lang || 'en-US'
  if (lang.startsWith('ar')) return 'ar'
  if (lang.startsWith('de')) return 'de'
  if (lang.startsWith('fr')) return 'fr'
  return 'en'
}

export function titleFromFile(name: string) {
  return name
    .replace(/\.pdf$/i, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 90)
}

/** Guess grade, subject and term from an official file name. */
export function detectFromFilename(name: string) {
  const clean = name.toLowerCase().replace(/[%_\-\s]+/g, ' ')
  const gradeMatch =
    clean.match(/(?:prep(?:aratory)?|prp|pe)\s*([123])\b/) ||
    clean.match(/\b([123])\s*(?:prep|prp|اعدادي|إعدادي)\b/) ||
    clean.match(/\b(first|second|third)\s*(?:prep|prp)\b/)
  let grade: 1 | 2 | 3 | 4 | undefined
  if (gradeMatch) {
    const raw = gradeMatch[1]
    grade = raw === '1' || raw === 'first' ? 1 : raw === '2' || raw === 'second' ? 2 : 3
  }
  if (!grade) {
    if (/(?:primary|prim|p)\s*4\b|4\s*(?:prim|ابتدائ)|رابع[ةه]?\s*ابتدائ/.test(clean)) grade = 4
    else if (/اول[ى]?\s*اعداد|أول[ى]?\s*إعداد/.test(name)) grade = 1
    else if (/ثاني[ةه]?\s*اعداد|ثاني[ةه]?\s*إعداد/.test(name)) grade = 2
    else if (/ثالث[ةه]?\s*اعداد|ثالث[ةه]?\s*إعداد/.test(name)) grade = 3
  }

  let subject: Subject | undefined
  if (/(connect|english|eng\b)/i.test(name)) subject = 'English'
  else if (/(arabic|عرب|لغتي|اللغة العربية)/i.test(name)) subject = 'Arabic'
  else if (/(german|deutsch|ألمان|المان)/i.test(name)) subject = 'German'
  else if (/(french|fran[cç]ais|فرنس)/i.test(name)) subject = 'French'
  else if (/(science|sci\b|علوم)/i.test(name)) subject = 'Science'
  else if (/(math|mtah|mathemat|رياض)/i.test(name)) subject = 'Mathematics'
  else if (/(social|studies|دراسات)/i.test(name)) subject = 'Social Studies'

  const term: 'Term 1' | 'Term 2' = /(term\s*2|tr\s*2|_t2|تاني|ثاني\s*ترم)/i.test(name) ? 'Term 2' : 'Term 1'

  return { grade, subject, term }
}

export function matchCatalog(meta: { grade?: 1 | 2 | 3 | 4; subject?: Subject; term?: 'Term 1' | 'Term 2' }) {
  if (!meta.grade || !meta.subject) return undefined
  return officialBooks.find(
    (book) => book.grade === meta.grade && book.subject === meta.subject && book.term === (meta.term || 'Term 1'),
  )
}

export interface ImportResult {
  book: Book
  meta: ImportMeta
}

/**
 * Read a PDF, store its bytes and index every page locally.
 * Cleans up partial data when something fails.
 */
export async function importPdfFile(
  file: File,
  meta: ImportMeta,
  onProgress?: (page: number, total: number) => void,
): Promise<Book> {
  const id = meta.catalog?.id || `local-${crypto.randomUUID()}`
  let stored = false
  try {
    const bytes = new Uint8Array(await file.arrayBuffer())
    await savePdfBytes(id, bytes)
    stored = true

    const chapter = await extractChapterFromBytes(bytes, id, onProgress)
    const pageCount = chapter.pages.length
    const units = detectUnits(chapter.pages, pageCount)
    const subject = meta.subject
    const subjectInfo = subjectMeta[subject] || { emoji: '📚', color: '#21e6c9' }

    return {
      id,
      title: meta.title.trim() || titleFromFile(file.name),
      subject,
      language: meta.catalog?.language || languageFor(subject),
      emoji: subjectInfo.emoji,
      accent: subjectInfo.color,
      term: meta.term,
      description: meta.catalog
        ? 'Official Ministry of Education book · Term 1'
        : 'Added from your device · text stays local.',
      file: `local:${id}`,
      pageCount,
      grade: meta.grade,
      custom: true,
      catalogId: meta.catalog?.id,
      sourceUrl: meta.catalog?.url,
      sizeMb: Number((file.size / (1024 * 1024)).toFixed(1)),
      units,
    }
  } catch (err) {
    if (stored) {
      await deletePdfBytes(id)
      await deleteChapterCache(id)
    }
    throw err
  }
}
