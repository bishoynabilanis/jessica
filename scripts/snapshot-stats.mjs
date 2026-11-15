/**
 * Daily snapshot of the anonymous counters into public/stats.json.
 *
 * The counter service is a free public counter; keeping our own history means a
 * bad day on their side never loses the trend. Runs from .github/workflows/stats.yml.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'

const BASE = 'https://abacus.jasoncameron.dev'
const NAMESPACE = 'jessica-bishoy'
const OUTPUT = 'public/stats.json'
const KEEP_DAYS = 120

async function read(key) {
  try {
    const res = await fetch(`${BASE}/get/${NAMESPACE}/${key}`, { cache: 'no-store' })
    if (!res.ok) return null
    const json = await res.json()
    return typeof json?.value === 'number' ? json.value : null
  } catch {
    return null
  }
}

const [opens, installs, pwa] = await Promise.all([read('opens'), read('installs'), read('pwa-opens')])
const today = new Date().toISOString().slice(0, 10)

let store = { updatedAt: null, days: [] }
try {
  store = JSON.parse(await readFile(OUTPUT, 'utf8'))
  if (!Array.isArray(store.days)) store.days = []
} catch {
  /* first run */
}

// Same-day runs replace the entry instead of appending.
store.days = store.days.filter((day) => day.date !== today)
store.days.push({ date: today, opens, installs, pwa })
store.days = store.days.sort((a, b) => a.date.localeCompare(b.date)).slice(-KEEP_DAYS)
store.updatedAt = new Date().toISOString()

await mkdir(dirname(OUTPUT), { recursive: true })
await writeFile(OUTPUT, `${JSON.stringify(store, null, 2)}\n`, 'utf8')
console.log(`stats: ${today} opens=${opens} installs=${installs} pwa=${pwa}`)
