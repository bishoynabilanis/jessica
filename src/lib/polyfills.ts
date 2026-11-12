/**
 * Small web-API polyfills for older phones (Android 8/9, iOS 12–13).
 * Loaded before the app so a missing API can never crash the first paint.
 */

type CryptoWithUuid = Crypto & { randomUUID?: () => string }

if (typeof crypto !== 'undefined' && typeof (crypto as CryptoWithUuid).randomUUID !== 'function') {
  ;(crypto as CryptoWithUuid).randomUUID = () => {
    const bytes = new Uint8Array(16)
    if (typeof crypto.getRandomValues === 'function') crypto.getRandomValues(bytes)
    else for (let i = 0; i < 16; i += 1) bytes[i] = Math.floor(Math.random() * 256)
    bytes[6] = (bytes[6] & 0x0f) | 0x40
    bytes[8] = (bytes[8] & 0x3f) | 0x80
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
  }
}

const objectWithHasOwn = Object as unknown as { hasOwn?: (target: object, key: PropertyKey) => boolean }
if (typeof objectWithHasOwn.hasOwn !== 'function') {
  Object.defineProperty(Object, 'hasOwn', {
    value: (target: object, key: PropertyKey) => Object.prototype.hasOwnProperty.call(target, key),
    configurable: true,
    writable: true,
  })
}

if (typeof globalThis.structuredClone !== 'function') {
  globalThis.structuredClone = function structuredCloneFallback<T>(value: T): T {
    if (value === undefined || value === null || typeof value !== 'object') return value
    try {
      return JSON.parse(JSON.stringify(value)) as T
    } catch {
      return value
    }
  } as typeof structuredClone
}
