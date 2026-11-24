const BASE = 'https://abacus.jasoncameron.dev'
const NAMESPACE = 'jessica-bishoy'
const OPEN_KEY = 'opens'
const INSTALL_KEY = 'install-browsers-v2'
const BROWSER_KEY = 'browsers-v2'
const SESSION_FLAG = 'jessica-counted-session'
const INSTALL_FLAG = 'jessica-install-v2'
const BROWSER_FLAG = 'jessica-browser-v2'
const LOCAL_KEY = 'jessica-local-opens'

export interface AppCounters {
  opens: number | null
  installs: number | null
  browsers: number | null
}

function readJson(value: unknown): number | null {
  if (value && typeof value === 'object' && 'value' in value) {
    const raw = (value as { value?: unknown }).value
    return typeof raw === 'number' && Number.isFinite(raw) && raw >= 0 ? raw : null
  }
  return null
}

async function request(key: string, increment = false): Promise<number | null> {
  try {
    const response = await fetch(`${BASE}/${increment ? 'hit' : 'get'}/${NAMESPACE}/${key}`, {
      cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer',
      signal: AbortSignal.timeout(6000),
    })
    // A missing key has never been created. Do not create it just to display it.
    if (!increment && response.status === 404) return 0
    if (!response.ok) return null
    return readJson(await response.json())
  } catch {
    return null
  }
}

function shouldCount() {
  try {
    const raw = localStorage.getItem('jessica-profile-v1')
    return !raw || JSON.parse(raw)?.state?.settings?.shareCounts !== false
  } catch {
    return false
  }
}

export function localOpens(): number {
  try { return Number(localStorage.getItem(LOCAL_KEY) || 0) } catch { return 0 }
}

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
}

const active = new Map<string, Promise<void>>()

/** Only local booleans, never a generated device ID or fingerprint. */
async function countOnce(key: string, flag: string, storage: Storage) {
  if (!shouldCount()) return
  if (active.has(flag)) return active.get(flag)
  const work = async () => {
    if (!shouldCount()) return
    try {
      if (storage.getItem(flag)) return
      // Require working storage: otherwise each reload could count again.
      storage.setItem(`${flag}-probe`, '1')
      storage.removeItem(`${flag}-probe`)
      // Reserve before sending. An ambiguous failed request is not retried,
      // since it might already have incremented remotely. This can undercount.
      storage.setItem(flag, 'attempted')
    } catch { return }
    const value = await request(key, true)
    if (value != null) {
      try { storage.setItem(flag, 'counted') } catch { /* reservation remains */ }
    }
  }
  const promise = (navigator.locks
    ? navigator.locks.request(`jessica-${flag}`, work)
    : work()).finally(() => active.delete(flag))
  active.set(flag, promise)
  return promise
}

export async function registerOpen() {
  try { localStorage.setItem(LOCAL_KEY, String(localOpens() + 1)) } catch { /* local only */ }
  if (!shouldCount()) return
  // New counters deliberately start fresh; no historical totals are relabeled.
  try {
    await countOnce(BROWSER_KEY, BROWSER_FLAG, localStorage)
    if (isStandalone()) await registerInstall()
    await countOnce(OPEN_KEY, SESSION_FLAG, sessionStorage)
  } catch { /* counting must never stop the app */ }
}

/** Both installation signals use the same key and the same local flag. */
export async function registerInstall() {
  try { await countOnce(INSTALL_KEY, INSTALL_FLAG, localStorage) } catch { /* optional */ }
}

export const registerPwaOpen = registerInstall

export async function readCounters(): Promise<AppCounters> {
  if (!shouldCount()) return { opens: null, installs: null, browsers: null }
  const [opens, installs, browsers] = await Promise.all([
    request(OPEN_KEY), request(INSTALL_KEY), request(BROWSER_KEY),
  ])
  return { opens, installs, browsers }
}
