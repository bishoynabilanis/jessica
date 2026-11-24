import type { ChapterText, PageText } from '@/types'

/**
 * Book detective: the passage and the evidence both come from the real text
 * of a Ministry-book unit. The clue word is a word that really appears in
 * exactly two sentences of the passage, and those two sentences are the
 * evidence. Nothing is written by the app, so a unit with no usable text
 * gives no case.
 */

export interface DetectiveSentence {
  id: number
  text: string
  page: number
  evidence: boolean
}

export interface DetectiveCase {
  clue: string
  page: number
  sentences: DetectiveSentence[]
}

const STOP = new Set([
  'التي', 'الذي', 'الذين', 'هذا', 'هذه', 'ذلك', 'تلك', 'على', 'إلى', 'الى', 'عن', 'من', 'في', 'مع', 'بين', 'كان', 'كانت', 'يكون', 'تكون', 'أن', 'إن', 'ان', 'أو', 'كما', 'عند', 'حيث', 'لكن', 'ولكن', 'ثم', 'قد', 'كل', 'بعض', 'هو', 'هي', 'هم', 'ما', 'لا', 'لم', 'لن', 'التى', 'الذى', 'هناك', 'عندما', 'بعد', 'قبل', 'خلال', 'أي', 'اي', 'أيضا', 'أيضاً', 'فقط', 'يمكن',
])

function normalize(word: string) {
  return word
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .toLowerCase()
}

export function wordsOf(sentence: string): string[] {
  return (sentence.match(/[\u0600-\u06FFA-Za-z]+/g) || []).map(normalize)
}

function stem(word: string) {
  return word.length > 5 && word.startsWith('ال') ? word.slice(2) : word
}

export function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!؟?۔])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 25 && s.length <= 220 && /[\u0600-\u06FF]/.test(s))
}

export function isEvidence(sentence: string, clue: string) {
  return wordsOf(sentence).some((w) => stem(w) === clue)
}

export function makeDetectiveCase(pages: PageText[], rng: () => number = Math.random, size = 6): DetectiveCase | null {
  const windows: Array<{ page: number; list: string[] }> = []
  for (const p of pages) {
    const list = splitSentences(p.text)
    for (let i = 0; i + size <= list.length; i += 2) windows.push({ page: p.page, list: list.slice(i, i + size) })
  }
  for (let i = windows.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[windows[i], windows[j]] = [windows[j], windows[i]]
  }
  for (const win of windows) {
    const perSentence = win.list.map((s) => new Set(wordsOf(s).map(stem)))
    const counts = new Map<string, number>()
    perSentence.forEach((set) => set.forEach((w) => counts.set(w, (counts.get(w) || 0) + 1)))
    const clues = [...counts.entries()].filter(([w, c]) => c === 2 && w.length >= 4 && !STOP.has(w) && !STOP.has('ال' + w) && /[\u0600-\u06FF]/.test(w)).map(([w]) => w)
    if (!clues.length) continue
    const clue = clues[Math.floor(rng() * clues.length)]
    const sentences = win.list.map((text, id) => ({ id, text, page: win.page, evidence: isEvidence(text, clue) }))
    if (sentences.filter((s) => s.evidence).length !== 2) continue
    return { clue, page: win.page, sentences }
  }
  return null
}

export function detectiveCaseFor(chapter: ChapterText | undefined, startPage: number, endPage: number, rng?: () => number) {
  if (!chapter) return null
  return makeDetectiveCase(chapter.pages.filter((p) => p.page >= startPage && p.page <= endPage), rng)
}

/** The clue as the child sees it: the exact word from the first evidence sentence. */
export function clueDisplay(c: DetectiveCase) {
  const first = c.sentences.find((s) => s.evidence)
  const raw = first ? (first.text.match(/[\u0600-\u06FFA-Za-z]+/g) || []).find((w) => stem(normalize(w)) === c.clue) : undefined
  return raw || c.clue
}
