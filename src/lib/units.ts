import type { BookUnit, PageText } from '@/types'

/**
 * Pull unit / lesson headings out of the extracted textbook text so the reader
 * can offer a real chapter picker without a hand-written table of contents.
 */

const PATTERNS: RegExp[] = [
  /(?:^|\s)(unit|chapter|module|theme|section)\s+([0-9]{1,2}|[ivxlc]{1,6}|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\b[.:\-–—\s]*(.{0,70})/i,
  /(?:^|\s)(unit[ée]|le[çc]on|chapitre|partie|module)\s+([0-9]{1,2}|[ivxlc]{1,6})\b[.:\-–—\s]*(.{0,70})/i,
  /(?:^|\s)(lektion|kapitel|einheit|modul|teil)\s+([0-9]{1,2}|[ivxlc]{1,6})\b[.:\-–—\s]*(.{0,70})/i,
  /(?:^|\s)(الوحدة|الدرس|الفصل|المحور)\s*([0-9٠-٩]{1,2}|[أ-ي]{1,10})?\s*[:\-–—]?\s*(.{0,70})/,
]

const TOC = /(table of contents|contents|الفهرس|فهرس المحتويات|sommaire|inhaltsverzeichnis)/i
const ARABIC_DIACRITICS = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g

function normalizeArabic(text: string) {
  return text
    .normalize('NFKC')
    .replace(ARABIC_DIACRITICS, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
}

function isArabicBook(pages: PageText[]) {
  const sample = pages.slice(0, 8).map((p) => p.text).join(' ').slice(0, 4000)
  const arabic = (sample.match(/[\u0600-\u06FF]/g) || []).length
  return arabic > sample.length * 0.35
}

function cleanTitle(raw: string) {
  return raw
    .split('\n')[0]
    .replace(/\.{2,}.*$/, '')
    .replace(/\s+/g, ' ')
    .replace(/[|•·]+/g, ' ')
    .replace(/\b(learning outcomes?|learning objectives?|objectives?|contents?)\b.*$/i, '')
    .trim()
    .replace(/^[:\-–—\s]+/, '')
    .replace(/[:\-–—\s]+$/, '')
    .slice(0, 70)
}

function matchHeading(text: string) {
  // Headings normally sit in the first line or two of a page.
  const head = text.slice(0, 260)
  for (const pattern of PATTERNS) {
    const match = pattern.exec(head)
    if (!match) continue
    if (match.index > 140) continue
    const number = (match[2] || '').trim()
    const rest = cleanTitle(match[3] || '')
    if (!number && !rest) continue
    const label = match[1]
    const key = `${label} ${number}`.trim().toLowerCase()
    let title = rest ? `${label} ${number} — ${rest}` : `${label} ${number}`

    if (!rest || /\b(in|of|the|and|to|a|an|for|with|on|at|by|from)$/i.test(rest)) {
      const lines = head
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
      const index = lines.findIndex((line) => line.toLowerCase().includes(`${label} ${number}`.toLowerCase()))
      const noisy = /^(learning\s+outcomes?|objectives?|contents?|in this unit|unit\s+\d)/i
      const connector = /\b(in|of|the|and|to|a|an|for|with|on|at|by|from)$/i
      const parts: string[] = []
      for (let i = index + 1; i < lines.length && parts.length < 2; i++) {
        const line = lines[i]
        if (!line || line.length > 60 || noisy.test(line)) break
        parts.push(line)
        if (!connector.test(line)) break
      }
      if (parts.length) {
        title = `${label} ${number} — ${rest ? `${rest} ` : ''}${parts.join(' ')}`
      }
    }

    return { key, title: title.trim() }
  }
  return null
}

function fallbackUnits(pageCount: number, arabic = false): BookUnit[] {
  if (pageCount < 40) return []
  const size = 20
  const units: BookUnit[] = []
  for (let start = 3, index = 1; start <= pageCount; start += size, index++) {
    const endPage = Math.min(pageCount, start + size - 1)
    units.push({
      id: `part-${index}`,
      title: arabic ? `القسم ${index}` : `Part ${index}`,
      startPage: start,
      endPage,
    })
    if (units.length >= 12) break
  }
  return units
}

export function detectUnits(pages: PageText[], pageCount = pages.length): BookUnit[] {
  const arabic = isArabicBook(pages)
  // Arabic textbooks use presentation-form ligatures that make heading parsing
  // unreliable, so they get clean numbered sections instead of garbled titles.
  if (arabic) return fallbackUnits(pageCount, true)

  const found: { key: string; title: string; page: number }[] = []
  let currentKey = ''

  pages.forEach((page) => {
    if (!page.text.trim()) return
    if (page.page <= 2) return
    if (TOC.test(page.text.slice(0, 400))) return

    const hit = matchHeading(page.text)
    if (!hit) return
    if (hit.key === currentKey) return
    currentKey = hit.key
    found.push({ ...hit, page: page.page })
  })

  if (found.length < 2) return fallbackUnits(pageCount)

  return found.map((unit, index) => ({
    id: `unit-${index + 1}`,
    title: unit.title,
    startPage: unit.page,
    endPage: (found[index + 1]?.page ?? pageCount + 1) - 1,
  }))
}

export function unitForPage(units: BookUnit[] | undefined, page: number) {
  if (!units?.length) return undefined
  return units.find((unit) => page >= unit.startPage && page <= unit.endPage) || units[0]
}
