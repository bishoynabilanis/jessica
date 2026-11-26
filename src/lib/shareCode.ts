import { Inflate, deflateSync, strFromU8, strToU8 } from 'fflate'
import { MAX_CODE_CHARS, MAX_JSON_BYTES } from '@/lib/sharedPayload'

/**
 * Sharing without a server: the paper itself travels inside the link.
 * fflate keeps a 20-question paper around ~1–2 KB of URL, which every chat app
 * and QR code can carry.
 */

function toBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(value: string): Uint8Array {
  const binary = atob(value.replace(/-/g, '+').replace(/_/g, '/'))
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index)
  return bytes
}

export function encodeShare(payload: unknown): string {
  return toBase64Url(deflateSync(strToU8(JSON.stringify(payload))))
}

/** Inflate with a hard size cap, so a tiny link cannot expand into a huge payload. */
function inflateCapped(bytes: Uint8Array, max: number): Uint8Array | null {
  const chunks: Uint8Array[] = []
  let total = 0
  let tooBig = false
  const stream = new Inflate((chunk) => {
    total += chunk.length
    if (total > max) {
      tooBig = true
      return
    }
    chunks.push(chunk)
  })
  stream.push(bytes, true)
  if (tooBig) return null
  const out = new Uint8Array(total)
  let at = 0
  for (const chunk of chunks) {
    out.set(chunk, at)
    at += chunk.length
  }
  return out
}

export function decodeShare<T>(code: string): T | null {
  try {
    if (typeof code !== 'string' || code.length > MAX_CODE_CHARS) return null
    const bytes = inflateCapped(fromBase64Url(code), MAX_JSON_BYTES)
    return bytes ? (JSON.parse(strFromU8(bytes)) as T) : null
  } catch {
    return null
  }
}

/** The link a parent or teacher can paste in any chat. */
export function shareLink(route: string, payload: unknown): string {
  const base = `${window.location.origin}${window.location.pathname}`
  return `${base}#${route}?share=${encodeShare(payload)}`
}
