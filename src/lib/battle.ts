import type { BattlePayload } from '@/types'
import { MAX_CODE_CHARS, MAX_JSON_BYTES, cleanId, cleanNumber, cleanQuestions } from '@/lib/sharedPayload'

function encodeBase64Url(str: string) {
  const bytes = new TextEncoder().encode(str)
  let binary = ''
  bytes.forEach((b) => (binary += String.fromCharCode(b)))
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function decodeBase64Url(str: string) {
  if (str.length > MAX_CODE_CHARS) throw new Error('link too long')
  const padded = str.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(padded + '==='.slice((padded.length + 3) % 4))
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
  if (bytes.length > MAX_JSON_BYTES) throw new Error('link too big')
  return new TextDecoder().decode(bytes)
}

export function encodeBattle(payload: BattlePayload) {
  return encodeBase64Url(JSON.stringify(payload))
}

export function decodeBattle(code: string): BattlePayload | null {
  try {
    const parsed = JSON.parse(decodeBase64Url(code)) as Record<string, unknown>
    const questions = cleanQuestions(parsed?.questions)
    if (!questions.length || typeof parsed.subject !== 'string' || !parsed.subject) return null
    return {
      v: 1,
      id: cleanId(parsed.id) || 'shared',
      subject: parsed.subject.slice(0, 80),
      bookId: typeof parsed.bookId === 'string' ? parsed.bookId.slice(0, 80) : undefined,
      challenger: typeof parsed.challenger === 'string' ? parsed.challenger.slice(0, 60) : '',
      target: cleanNumber(parsed.target, 0, 1000, 0),
      questions,
    }
  } catch {
    return null
  }
}

export function battleShareUrl(payload: BattlePayload) {
  const code = encodeBattle(payload)
  return `${window.location.origin}${window.location.pathname}#/battle?d=${code}`
}

export function buildWhatsAppUrl(text: string, phone?: string) {
  const base = phone
    ? `https://wa.me/${phone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(text)}`
    : `https://wa.me/?text=${encodeURIComponent(text)}`
  return base
}

export function buildWhatsAppScheme(text: string) {
  return `whatsapp://send?text=${encodeURIComponent(text)}`
}
