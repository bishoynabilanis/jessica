/**
 * One tiny celebration bus. Any screen can fire it; one layer draws the burst.
 * Kept dependency-free and cheap: a few transforms, removed after the animation.
 */

type Listener = () => void

const listeners = new Set<Listener>()

export function celebrate() {
  for (const listener of listeners) listener()
}

export function onCelebrate(listener: Listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
