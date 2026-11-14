import type { PageText } from '@/types'

/**
 * Turns the plain text of one unit into a lesson: the points it makes, the
 * terms it repeats and a cloze check built from its own sentences.
 *
 * No AI key and no network: the whole lesson is derived from the pages the
 * learner already has, so it works on a plane and costs nothing.
 */

const AR_STOP = new Set([
  'من', 'في', 'على', 'إلى', 'عن', 'أن', 'إن', 'كان', 'كانت', 'هذا', 'هذه', 'ذلك', 'تلك',
  'التي', 'الذي', 'الذين', 'مع', 'أو', 'ثم', 'قد', 'كل', 'بعض', 'ما', 'لا', 'لم', 'لن',
  'هو', 'هي', 'هم', 'كما', 'بين', 'بعد', 'قبل', 'عند', 'حتى', 'إذا', 'حيث', 'وهو',
  'وهي', 'ولا', 'وما', 'ومن', 'بها', 'به', 'له', 'لها', 'هناك', 'أيضا', 'كذلك', 'غير',
  'أكثر', 'أقل', 'أي', 'نحو', 'خلال', 'دون', 'سوف', 'الآن', 'هنا', 'لأن', 'لكن', 'بل',
  'ليس', 'ليست', 'عليه', 'عليها', 'منه', 'منها', 'فيه', 'فيها', 'إليه', 'إليها',
  // textbook furniture, not concepts
  'وحدة', 'مثال', 'أمثلة', 'شكل', 'جدول', 'رقم', 'صفحة', 'درس', 'فصل', 'سؤال',
  'أسئلة', 'تمرين', 'تمارين', 'نشاط', 'لاحظ', 'أكمل', 'اذكر', 'عدد',
])

const EN_STOP = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'these', 'those', 'from', 'have', 'has',
  'had', 'are', 'was', 'were', 'will', 'would', 'can', 'could', 'should', 'there',
  'their', 'them', 'then', 'than', 'when', 'what', 'which', 'who', 'how', 'why',
  'into', 'over', 'under', 'about', 'also', 'such', 'each', 'other', 'more', 'most',
  'some', 'only', 'very', 'just', 'not', 'you', 'your', 'they', 'been', 'being',
  'its', 'it', 'is', 'of', 'to', 'in', 'on', 'at', 'as', 'by', 'be', 'or', 'an', 'a',
])

export interface KeyTerm {
  term: string
  sentence: string
  count: number
}

export interface ClozeQuestion {
  id: string
  prompt: string
  options: string[]
  answer: number
  term: string
  sentence: string
}

function stripDiacritics(word: string) {
  return word.replace(/[\u064B-\u0652\u0670\u0640]/g, '')
}

function normalize(word: string) {
  const clean = stripDiacritics(word)
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
  return clean.length > 4 && clean.startsWith('ال') ? clean.slice(2) : clean
}

/** Stop-lists are normalised with the same rules as the tokens they filter. */
const AR_STOP_NORMALISED = new Set([...AR_STOP].map((word) => normalize(word)))
const EN_STOP_NORMALISED = new Set([...EN_STOP])

function sentencesOf(text: string) {
  return text
    .replace(/\[Page \d+\]/g, ' ')
    .split(/(?<=[.!?؟।])\s+|\n+/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter((line) => line.length >= 24)
}

function tokensOf(line: string) {
  return line
    .split(/[^\p{L}\p{N}]+/u)
    .map((word) => word.trim())
    .filter((word) => word.length >= 3 && !/\d/.test(word))
}

/** Frequency-based key terms, each shown with the sentence that explains it best. */
export function keyTerms(pages: PageText[], limit = 6): KeyTerm[] {
  const counts = new Map<string, { display: string; count: number; sentences: string[] }>()
  const sentences = pages.flatMap((page) => sentencesOf(page.text))

  for (const sentence of sentences) {
    for (const token of tokensOf(sentence)) {
      const key = normalize(token)
      if (!key || key.length < 3) continue
      if (AR_STOP_NORMALISED.has(key) || EN_STOP_NORMALISED.has(key.toLowerCase())) continue
      const entry = counts.get(key)
      if (entry) {
        entry.count += 1
        if (!entry.sentences.includes(sentence)) entry.sentences.push(sentence)
      } else {
        counts.set(key, { display: stripDiacritics(token), count: 1, sentences: [sentence] })
      }
    }
  }

  const ranked = [...counts.values()]
    .sort((a, b) => b.count - a.count || b.display.length - a.display.length)
  const repeated = ranked.filter((entry) => entry.count >= 2)
  const pool = repeated.length >= 4 ? repeated : ranked

  // Prefer a sentence that repeats the term or is short and focused, and never
  // reuse the same sentence for two different terms.
  const used = new Set<string>()
  return pool.slice(0, limit).map((entry) => {
    const candidates = [...entry.sentences].sort((a, b) => {
      const density = (text: string) => text.split(entry.display).length - 1
      return density(b) - density(a) || a.length - b.length
    })
    const sentence = candidates.find((item) => !used.has(item)) || candidates[0] || ''
    if (sentence) used.add(sentence)
    return { term: entry.display, sentence, count: entry.count }
  })
}

/** The first few statements of the unit, used as "what you will learn". */
export function objectivesOf(pages: PageText[], limit = 3): string[] {
  const seen = new Set<string>()
  const picked: string[] = []
  for (const sentence of pages.flatMap((page) => sentencesOf(page.text))) {
    const key = sentence.slice(0, 48)
    if (seen.has(key)) continue
    if (sentence.length > 180) continue
    seen.add(key)
    picked.push(sentence)
    if (picked.length >= limit) break
  }
  return picked
}

/** A stable shuffle so a reload shows the same lesson. */
function seededShuffle<T>(list: T[], seed: string) {
  let hash = 0
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) % 2147483647
  const out = [...list]
  for (let i = out.length - 1; i > 0; i -= 1) {
    hash = (hash * 1103515245 + 12345) % 2147483647
    const j = hash % (i + 1)
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function blank(sentence: string, term: string) {
  if (!term) return sentence
  const parts = sentence.split(term)
  return parts.join('____')
}

/** Multiple-choice recall: the blank is the term, the distractors are its peers. */
export function clozeQuiz(terms: KeyTerm[], count = 4): ClozeQuestion[] {
  // One question per sentence: repeating the same sentence makes the answer obvious.
  const seenSentences = new Set<string>()
  const usable = terms.filter((term) => {
    if (term.term.length < 3 || !term.sentence.includes(term.term)) return false
    if (seenSentences.has(term.sentence)) return false
    seenSentences.add(term.sentence)
    return true
  })
  if (usable.length < 2) return []

  return usable.slice(0, count).map((item, index) => {
    const distractors = usable
      .filter((other) => other.term !== item.term)
      .slice(0, 3)
      .map((other) => other.term)
    const options = seededShuffle([item.term, ...distractors], `${item.term}${index}`)
    return {
      id: `cloze-${index}`,
      prompt: blank(item.sentence, item.term),
      options,
      answer: options.indexOf(item.term),
      term: item.term,
      sentence: item.sentence,
    }
  })
}
