/**
 * A parent note is plain text only: no links, no markup, no hidden or direction-changing
 * characters, at most 100 characters (counted as characters, so an emoji is one).
 */
export const PARENT_NOTE_MAX = 100

const INVISIBLE = /[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u2060\u202a-\u202e\u2066-\u2069\ufeff]+/g
const TAG = /<(\/?[a-zA-Z!][^<>]*)?>/g
const SCHEME_URL = /(https?:\/\/|www\.)\S*/gi
const EMAIL = /\S+@\S+\.\S+/g
const DOMAIN_PATH = /\b[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}\/\S*/gi
const DOMAIN_TLD =
  /\b[a-z0-9-]+(\.[a-z0-9-]+)*\.(com|net|org|io|co|me|ly|app|dev|xyz|info|biz|ai|gg|tv|us|uk|eg|ae|sa|ru|cc|link|click|site|online|shop|store|top|to|be|gl|ee|im|fm)\b/gi

const DISGUISED_DOT = /\s*[\[(]\s*(\.|dot)\s*[\])]\s*|\s+\.(?=[a-z0-9])/gi
const PHONE = /\+?\d(?:[\s().-]?\d){6,}/g
const SCHEME = /\b(javascript|vbscript|data|file):/gi

function once(text: string): string {
  return text
    .normalize('NFKC')
    .replace(DISGUISED_DOT, '.')
    .replace(SCHEME, '')
    .replace(PHONE, '')
    .replace(INVISIBLE, ' ')
    .replace(TAG, '')
    .replace(SCHEME_URL, '')
    .replace(EMAIL, '')
    .replace(DOMAIN_PATH, '')
    .replace(DOMAIN_TLD, '')
}

export function clipNote(text: string, max = PARENT_NOTE_MAX): string {
  return Array.from(text).slice(0, max).join('')
}

export function noteLength(text: string): number {
  return Array.from(text).length
}

export function cleanParentNote(text: unknown): string {
  if (typeof text !== 'string') return ''
  let out = clipNote(text, 2000)
  for (let i = 0; i < 3; i++) {
    const next = once(out)
    if (next === out) break
    out = next
  }
  return clipNote(out.replace(/\s+/g, ' ').trim())
}

/** Whatever was saved or imported, the child only ever gets a clean string note (or nothing). */
export function safeParentNote(note: unknown): { text: string; at: number } | null {
  if (!note || typeof note !== 'object') return null
  const raw = note as { text?: unknown; at?: unknown }
  const text = cleanParentNote(raw.text)
  if (!text) return null
  return { text, at: typeof raw.at === 'number' && Number.isFinite(raw.at) ? raw.at : 0 }
}
