/**
 * When AI cannot run at all we never leave the user with a dead button: this
 * bus opens one modal that explains the two free paths (local model or own key).
 */

export type AiNeed = 'limit' | 'setup'

type Listener = (reason: AiNeed) => void
const listeners = new Set<Listener>()

export function notifyAiNeed(reason: AiNeed) {
  for (const listener of listeners) listener(reason)
}

export function onAiNeed(listener: Listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
