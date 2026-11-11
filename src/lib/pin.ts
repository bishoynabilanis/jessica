/** Hash a parent PIN so it is not stored in plain text in localStorage. */
export async function hashPin(pin: string) {
  const value = `jessica:${pin}`
  try {
    if (crypto?.subtle) {
      const bytes = new TextEncoder().encode(value)
      const digest = await crypto.subtle.digest('SHA-256', bytes)
      return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
    }
  } catch {
    /* fall through */
  }
  let hash = 2166136261
  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return `fnv${(hash >>> 0).toString(16)}`
}

export function validPin(pin: string) {
  return /^\d{4,6}$/.test(pin)
}
