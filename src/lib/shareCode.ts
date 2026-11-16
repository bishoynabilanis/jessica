import { deflateSync, inflateSync, strFromU8, strToU8 } from 'fflate'

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

export function decodeShare<T>(code: string): T | null {
  try {
    return JSON.parse(strFromU8(inflateSync(fromBase64Url(code)))) as T
  } catch {
    return null
  }
}

/** The link a parent or teacher can paste in any chat. */
export function shareLink(route: string, payload: unknown): string {
  const base = `${window.location.origin}${window.location.pathname}`
  return `${base}#${route}?share=${encodeShare(payload)}`
}
