/**
 * More than one child on the same device.
 *
 * The app keeps one state blob in localStorage. A profile is a named copy of
 * that blob: switching snapshots the current one, then swaps the blob and
 * reloads, so both the store and every other page start from the right child.
 */

const REGISTRY_KEY = 'jessica-profiles-v1'
const STATE_KEY = 'jessica-profile-v1'
const slotKey = (id: string) => `jessica-slot-${id}`

export interface ProfileSlot {
  id: string
  name: string
  grade: number
  at: number
}

export interface ProfileRegistry {
  active: string
  slots: ProfileSlot[]
}

interface Persisted {
  state?: {
    name?: string
    settings?: { gradeLevel?: number }
    customBooks?: unknown[]
    apiKey?: string
    model?: string
    [key: string]: unknown
  }
  version?: number
}

function readJSON<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function readAppState(): Persisted | null {
  return readJSON<Persisted>(STATE_KEY)
}

function newId(): string {
  return `p_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`
}

export function readRegistry(): ProfileRegistry {
  const saved = readJSON<ProfileRegistry>(REGISTRY_KEY)
  if (saved && Array.isArray(saved.slots) && saved.slots.length) return saved

  const state = readAppState()
  const registry: ProfileRegistry = {
    active: 'p1',
    slots: [
      {
        id: 'p1',
        name: state?.state?.name || 'Profile 1',
        grade: state?.state?.settings?.gradeLevel || 7,
        at: Date.now(),
      },
    ],
  }
  writeRegistry(registry)
  return registry
}

function writeRegistry(registry: ProfileRegistry) {
  try {
    localStorage.setItem(REGISTRY_KEY, JSON.stringify(registry))
  } catch {
    /* private mode */
  }
}

/** Keep what the current child has done before leaving the slot. */
export function snapshotCurrent(registry = readRegistry()) {
  const current = localStorage.getItem(STATE_KEY)
  if (current) {
    try {
      localStorage.setItem(slotKey(registry.active), current)
    } catch {
      /* ignore quota */
    }
  }
}

export function switchProfile(target: string): boolean {
  const registry = readRegistry()
  if (target === registry.active) return false
  if (!registry.slots.some((slot) => slot.id === target)) return false

  snapshotCurrent(registry)
  const next = localStorage.getItem(slotKey(target))
  if (!next) return false

  try {
    localStorage.setItem(STATE_KEY, next)
  } catch {
    return false
  }
  writeRegistry({ ...registry, active: target })
  return true
}

export function createProfile(name: string, grade: number): ProfileSlot {
  const registry = readRegistry()
  snapshotCurrent(registry)

  const base = readAppState()
  const fresh = {
    state: {
      onboarded: true,
      acceptedTerms: 1,
      name: name.trim() || 'Profile',
      xp: 0,
      coins: 0,
      streak: 0,
      dailyLog: {},
      customBooks: base?.state?.customBooks || [],
      // a new child has never seen the checklist, whatever the parent turned off
      settings: { ...(base?.state?.settings || {}), gradeLevel: grade, quickStart: true },
      apiKey: base?.state?.apiKey || '',
      model: base?.state?.model,
    },
    version: base?.version || 3,
  }

  const slot: ProfileSlot = {
    id: newId(),
    name: fresh.state.name,
    grade,
    at: Date.now(),
  }
  try {
    localStorage.setItem(slotKey(slot.id), JSON.stringify(fresh))
  } catch {
    /* ignore */
  }
  writeRegistry({ ...registry, slots: [...registry.slots, slot] })
  return slot
}

/** Removes a profile and never leaves the app pointing at a missing slot. */
export function deleteProfile(id: string): boolean {
  const registry = readRegistry()
  if (registry.slots.length <= 1) return false
  const remaining = registry.slots.filter((slot) => slot.id !== id)
  if (!remaining.length) return false

  if (registry.active === id) {
    const fallback = remaining[0].id
    const next = localStorage.getItem(slotKey(fallback))
    if (next) {
      try {
        localStorage.setItem(STATE_KEY, next)
      } catch {
        return false
      }
      writeRegistry({ active: fallback, slots: remaining })
    } else {
      writeRegistry({ active: fallback, slots: remaining })
    }
  } else {
    writeRegistry({ ...registry, slots: remaining })
  }

  try {
    localStorage.removeItem(slotKey(id))
  } catch {
    /* ignore */
  }
  return true
}

export function activeProfile(): ProfileSlot | undefined {
  const registry = readRegistry()
  return registry.slots.find((slot) => slot.id === registry.active)
}
