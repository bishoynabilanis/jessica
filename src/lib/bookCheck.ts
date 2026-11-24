import type { Book, GradeLevel, SchoolType } from '@/types'
import { officialBooks, type OfficialBook } from '@/data/officialBooks'
import { schoolMedium } from '@/lib/school'

/**
 * "Is this the right book and the right edition?"
 *
 * Compares a book the student imported with the student's own grade and school
 * and with the Ministry list the app ships with. It never fetches anything: the
 * Ministry list is part of the app and the imported book is already on the device.
 */

export type FindingId = 'grade' | 'language' | 'year' | 'link' | 'size' | 'unknown'
export type Severity = 'warn' | 'problem'

export interface Finding {
  id: FindingId
  severity: Severity
  /** Values the message needs, already plain strings or numbers. */
  vars: Record<string, string | number>
}

export type Verdict = 'right' | 'check' | 'wrong'

export interface BookCheck {
  verdict: Verdict
  findings: Finding[]
  /** The Ministry entry this book was compared with, when there is one. */
  entry?: OfficialBook
}

/** "2026_2027" in a Ministry file path, as "2026/2027". */
export function editionYear(url?: string) {
  const match = url?.match(/(\d{4})_(\d{4})/)
  return match ? `${match[1]}/${match[2]}` : ''
}

export function ministryEntryFor(book: Pick<Book, 'catalogId' | 'grade' | 'subject' | 'term' | 'language'>, list: OfficialBook[] = officialBooks) {
  const byId = book.catalogId ? list.find((entry) => entry.id === book.catalogId) : undefined
  if (byId) return byId
  if (!book.grade) return undefined
  const same = list.filter(
    (entry) => entry.grade === book.grade && entry.subject === book.subject && entry.term === book.term,
  )
  return same.find((entry) => entry.language === book.language) || same[0]
}

export function checkBook(
  book: Book,
  student: { gradeLevel: GradeLevel; schoolType: SchoolType },
  list: OfficialBook[] = officialBooks,
): BookCheck {
  const findings: Finding[] = []
  const entry = ministryEntryFor(book, list)

  if (book.grade && book.grade !== student.gradeLevel) {
    findings.push({ id: 'grade', severity: 'problem', vars: { book: book.grade, student: student.gradeLevel } })
  }

  const medium = schoolMedium(student.schoolType)
  const contentSubject = book.subject === 'Mathematics' || book.subject === 'Science'
  if (contentSubject && book.language !== medium) {
    findings.push({
      id: 'language',
      severity: 'warn',
      vars: { book: book.language === 'ar' ? 'ar' : 'en', school: medium },
    })
  }

  if (entry) {
    const have = editionYear(book.sourceUrl)
    const want = editionYear(entry.url)
    if (have && want && have !== want) {
      findings.push({ id: 'year', severity: 'problem', vars: { have, want } })
    } else if (book.sourceUrl && book.sourceUrl !== entry.url) {
      findings.push({ id: 'link', severity: 'warn', vars: {} })
    }
    if (book.sizeMb && entry.sizeMb && Math.abs(book.sizeMb - entry.sizeMb) / entry.sizeMb > 0.25) {
      findings.push({ id: 'size', severity: 'warn', vars: { have: book.sizeMb, want: entry.sizeMb } })
    }
  } else {
    findings.push({ id: 'unknown', severity: 'warn', vars: {} })
  }

  const verdict: Verdict = findings.some((f) => f.severity === 'problem')
    ? 'wrong'
    : findings.length
      ? 'check'
      : 'right'
  return { verdict, findings, entry }
}
