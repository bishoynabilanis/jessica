import { TRIAL_ACTIONS_PER_DAY } from './config'

const KEY = 'jessica-ai-trial-v1'

type Listener = () => void
const listeners = new Set<Listener>()

interface TrialState {
  date: string
  used: number
}

function today() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function read(): TrialState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as TrialState
      if (parsed && parsed.date === today() && typeof parsed.used === 'number') return parsed
    }
  } catch {
    /* private mode */
  }
  return { date: today(), used: 0 }
}

function write(state: TrialState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
}

export function trialRemaining(): number {
  return Math.max(0, TRIAL_ACTIONS_PER_DAY - read().used)
}

export function trialUsed(): number {
  return read().used
}

/** Returns false when today's free actions are gone. */
export function consumeTrial(): boolean {
  const state = read()
  if (state.used >= TRIAL_ACTIONS_PER_DAY) return false
  write({ date: state.date, used: state.used + 1 })
  return true
}

export function onTrialLimit(listener: Listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function notifyTrialLimit() {
  for (const listener of listeners) listener()
}
