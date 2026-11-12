export type DeviceKind = 'ios' | 'android' | 'desktop'

/** Best-effort device detection for install instructions. */
export function deviceKind(): DeviceKind {
  if (typeof navigator === 'undefined') return 'desktop'
  const ua = navigator.userAgent
  const iPadOS = /Macintosh/.test(ua) && 'ontouchend' in document
  if (/iPad|iPhone|iPod/.test(ua) || iPadOS) return 'ios'
  if (/Android/i.test(ua)) return 'android'
  return 'desktop'
}

export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  const nav = navigator as Navigator & { standalone?: boolean }
  return window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true
}

export function isSafari(): boolean {
  if (typeof navigator === 'undefined') return false
  return /^((?!chrome|android|crios|fxios).)*safari/i.test(navigator.userAgent)
}
