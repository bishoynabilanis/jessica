const BASE = 'https://abacus.jasoncameron.dev'
const NAMESPACE = 'jessica-bishoy'
const OPEN_KEY = 'opens'
const INSTALL_KEY = 'installs'
const SESSION_FLAG = 'jessica-counted-session'
const INSTALL_FLAG = 'jessica-counted-install'
const LOCAL_KEY = 'jessica-local-opens'

export interface AppCounters {
  opens: number | null
  installs: number | null
}

function readJson(value: unknown) {
  if (value && typeof value === 'object' && 'value' in value) {
    const raw = (value as { value?: unknown }).value
    return typeof raw === 'number' ? raw : null
  }
  return null
}

async function hit(key: string): Promise<number | null> {
  try {
    const response = await fetch(`${BASE}/hit/${NAMESPACE}/${key}`, { cache: 'no-store' })
    if (!response.ok) return null
    return readJson(await response.json())
  } catch {
    return null
  }
}

async function get(key: string): Promise<number | null> {
  try {
    const response = await fetch(`${BASE}/get/${NAMESPACE}/${key}`, { cache: 'no-store' })
    if (!response.ok) return null
    return readJson(await response.json())
  } catch {
    return null
  }
}

function shouldCount() {
  try {
    const raw = localStorage.getItem('jessica-profile-v1')
    if (!raw) return true
    const parsed = JSON.parse(raw)
    const value = parsed?.state?.settings?.shareCounts
    return value !== false
  } catch {
    return true
  }
}

export function localOpens(): number {
  try {
    return Number(localStorage.getItem(LOCAL_KEY) || 0)
  } catch {
    return 0
  }
}

function bumpLocal() {
  try {
    localStorage.setItem(LOCAL_KEY, String(localOpens() + 1))
  } catch {
    /* ignore */
  }
}

/** Counts one open per browser session (anonymous, no identifiers). */
export async function registerOpen() {
  bumpLocal()
  if (!shouldCount()) return
  try {
    if (sessionStorage.getItem(SESSION_FLAG)) return
    sessionStorage.setItem(SESSION_FLAG, '1')
  } catch {
    /* private mode: still count once per page load */
  }
  await hit(OPEN_KEY)
}

/** Counts one install per device, when the browser fires `appinstalled`. */
export async function registerInstall() {
  if (!shouldCount()) return
  try {
    if (localStorage.getItem(INSTALL_FLAG)) return
    localStorage.setItem(INSTALL_FLAG, '1')
  } catch {
    /* ignore */
  }
  await hit(INSTALL_KEY)
}

export async function readCounters(): Promise<AppCounters> {
  const [opens, installs] = await Promise.all([get(OPEN_KEY), get(INSTALL_KEY)])
  return { opens, installs }
}
