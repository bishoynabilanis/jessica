// Safe rules for backups: secrets never leave in an export, and a restored
// file can only fill fields the app already has, with the same kind of value.

const SECRET_KEYS = new Set(['apiKey', 'aiKeys'])
const BLOCKED = new Set(['__proto__', 'constructor', 'prototype'])

function kind(value: unknown): string {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  return typeof value
}

function hasFunction(value: unknown, depth = 0): boolean {
  if (typeof value === 'function') return true
  if (depth > 6 || !value || typeof value !== 'object') return false
  return Object.values(value as Record<string, unknown>).some((v) => hasFunction(v, depth + 1))
}

/** What an export may contain: every saved value, never an AI key. */
export function exportablePayload(state: object): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(state)) {
    if (typeof value !== 'function' && !SECRET_KEYS.has(key)) out[key] = value
  }
  return out
}

function acceptable(current: unknown, incoming: unknown): boolean {
  if (incoming === undefined || typeof incoming === 'function' || hasFunction(incoming)) return false
  if (typeof incoming === 'number' && !Number.isFinite(incoming)) return false
  if (current === undefined || current === null) return true
  return kind(current) === kind(incoming)
}

/**
 * Keep only fields the app already knows, with the same type as today's value.
 * Secrets are dropped. `settings` is checked field by field.
 */
export function sanitizeImport(data: unknown, current: object): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  if (!data || typeof data !== 'object' || Array.isArray(data)) return out
  const now = current as Record<string, unknown>
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (BLOCKED.has(key) || SECRET_KEYS.has(key)) continue
    if (!(key in now) || typeof now[key] === 'function') continue
    if (key === 'settings') {
      if (!value || typeof value !== 'object' || Array.isArray(value)) continue
      const base = (now.settings || {}) as Record<string, unknown>
      const clean: Record<string, unknown> = {}
      for (const [sk, sv] of Object.entries(value as Record<string, unknown>)) {
        if (BLOCKED.has(sk) || !(sk in base)) continue
        if (acceptable(base[sk], sv)) clean[sk] = sv
      }
      out.settings = clean
      continue
    }
    if (acceptable(now[key], value)) out[key] = value
  }
  return out
}
