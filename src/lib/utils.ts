import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function uid(prefix = '') {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}

export function todayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function dayKeyOffset(offset: number) {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return todayKey(d)
}

export function formatDuration(totalSeconds: number) {
  const s = Math.max(0, Math.round(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m`
  return `${s}s`
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

export function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function pct(a: number, b: number) {
  if (!b) return 0
  return Math.round((a / b) * 100)
}

export function parseJsonLoose<T>(raw: string): T {
  let text = raw.trim()
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '')
  const first = Math.min(
    ...[text.indexOf('{'), text.indexOf('[')].filter((i) => i >= 0).concat([text.length]),
  )
  const lastObj = text.lastIndexOf('}')
  const lastArr = text.lastIndexOf(']')
  const last = Math.max(lastObj, lastArr)
  if (first > 0 || (last > 0 && last < text.length - 1)) {
    if (first >= 0 && last > first) text = text.slice(first, last + 1)
  }
  try {
    return JSON.parse(text) as T
  } catch {
    // Some models emit trailing commas.
    return JSON.parse(text.replace(/,\s*([}\]])/g, '$1')) as T
  }
}

export function stripMarkdown(text: string) {
  return text
    .replace(/```[\s\S]*?```/g, ' code block ')
    .replace(/\$\$[\s\S]*?\$\$/g, ' equation ')
    .replace(/\$[^$]*\$/g, ' equation ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~]/g, '')
    .replace(/\|/g, ' ')
    .replace(/\n{2,}/g, '\n')
    .trim()
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = String(reader.result || '')
      resolve(result.split(',')[1] || '')
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

export function pluralize(n: number, word: string) {
  return `${n} ${word}${n === 1 ? '' : 's'}`
}

export function localName() {
  try {
    return new Intl.DisplayNames(['en'], { type: 'language' })
  } catch {
    return null
  }
}

export function friendlyError(err: unknown) {
  const msg = err instanceof Error ? err.message : String(err)
  if (/quota|429/i.test(msg)) return 'The AI is a little busy (rate limit). Wait a moment and try again.'
  if (/API key|401|403|permission/i.test(msg))
    return 'Your Gemini key was rejected. Check it in Settings — it may be restricted or invalid.'
  if (/fetch|network|Failed to fetch/i.test(msg))
    return 'Network issue. Your offline tools still work — reconnect to use the AI tutor.'
  return msg
}


/** First name for greetings, keeping Egyptian compound names like عبد الرحمن. */
export function firstName(name?: string) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return ''
  const compound = ['عبد', 'أبو', 'ابو', 'أم', 'ام']
  if (compound.includes(parts[0]) && parts[1]) return `${parts[0]} ${parts[1]}`
  return parts[0]
}
