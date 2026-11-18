/**
 * Turning written text into something a voice can actually say.
 *
 * Two jobs live here:
 *  1. If a caller forgets to pass a language (a common bug when a page holds
 *     Arabic text but the UI is English), the Arabic script wins.
 *  2. Maths read aloud: "٢ + ٢ = ٤" should be spoken as words, not punctuation.
 *
 * Both are pure functions so they can be tested without a browser.
 */

const ARABIC_LETTER = /[\u0621-\u064A]/g
const ARABIC_DIGIT = /[\u0660-\u0669]/g

export function isArabicText(text: string): boolean {
  // Two letters is enough for a word; two Arabic-Indic digits are enough for
  // a maths line like "٢ + ٢ = ٤", which is still Arabic to the reader.
  return (text.match(ARABIC_LETTER) || []).length >= 2 || (text.match(ARABIC_DIGIT) || []).length >= 2
}

/** The language the voice should use, corrected from the text itself. */
export function detectSpeechLang(text: string, requested: string): string {
  if (isArabicText(text) && !requested.toLowerCase().startsWith('ar')) return 'ar'
  return requested
}

const ARABIC_SYMBOLS: Array<[RegExp, string]> = [
  [/=/g, ' يساوي '],
  [/\+/g, ' زائد '],
  [/[×✕]/g, ' في '],
  [/÷/g, ' على '],
  [/√/g, ' جذر '],
  [/%/g, ' في المية '],
  [/≈/g, ' تقريباً '],
  [/≠/g, ' لا يساوي '],
  [/[<>]/g, ' '],
]

/**
 * Arabic-only cleanup: English voices already read "=" and "+" correctly, so
 * the substitutions apply only when the sentence itself is Arabic.
 */
export function normalizeForSpeech(text: string): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (!isArabicText(clean)) return clean
  return ARABIC_SYMBOLS.reduce((value, [pattern, word]) => value.replace(pattern, word), clean)
    .replace(/\s{2,}/g, ' ')
    .trim()
}
