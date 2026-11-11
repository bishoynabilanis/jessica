import type { BattlePayload } from '@/types'

function encodeBase64Url(str: string) {
  const bytes = new TextEncoder().encode(str)
  let binary = ''
  bytes.forEach((b) => (binary += String.fromCharCode(b)))
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function decodeBase64Url(str: string) {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(padded + '==='.slice((padded.length + 3) % 4))
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

export function encodeBattle(payload: BattlePayload) {
  return encodeBase64Url(JSON.stringify(payload))
}

export function decodeBattle(code: string): BattlePayload | null {
  try {
    const parsed = JSON.parse(decodeBase64Url(code)) as BattlePayload
    if (!parsed?.questions?.length || !parsed.subject) return null
    return parsed
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
