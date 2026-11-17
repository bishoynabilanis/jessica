import { useCallback, useEffect, useRef, useState } from 'react'

/* --------------------------- PWA install prompt --------------------------- */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function useInstallPrompt() {
  const deferred = useRef<BeforeInstallPromptEvent | null>(null)
  const [canInstall, setCanInstall] = useState(false)
  const [installed, setInstalled] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches,
  )

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault()
      deferred.current = e as BeforeInstallPromptEvent
      setCanInstall(true)
    }
    const onInstalled = () => {
      setInstalled(true)
      setCanInstall(false)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const install = async () => {
    if (!deferred.current) return false
    await deferred.current.prompt()
    const choice = await deferred.current.userChoice
    deferred.current = null
    setCanInstall(false)
    return choice.outcome === 'accepted'
  }

  return { canInstall, installed, install }
}

/* ------------------------------- Idle logic ------------------------------- */
export function useIdle(timeoutMs: number, enabled = true) {
  const [idle, setIdle] = useState(false)
  const timer = useRef<number | null>(null)
  const fired = useRef(false)

  useEffect(() => {
    if (!enabled) return
    const reset = () => {
      setIdle(false)
      fired.current = false
      if (timer.current) window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => {
        setIdle(true)
        fired.current = true
      }, timeoutMs)
    }
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll']
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }))
    reset()
    return () => {
      events.forEach((e) => window.removeEventListener(e, reset))
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [timeoutMs, enabled])

  return { idle, fired: fired.current, reset: () => setIdle(false) }
}

/* ----------------------------- Study timer -------------------------------- */
export function useStudyTimer(active: boolean, onTick: (seconds: number) => void) {
  const cb = useRef(onTick)
  cb.current = onTick

  useEffect(() => {
    if (!active) return
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') cb.current(30)
    }, 30_000)
    return () => window.clearInterval(interval)
  }, [active])
}

/* --------------------------- Daily notifications -------------------------- */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported' as const
  if (Notification.permission === 'granted') return 'granted' as const
  if (Notification.permission === 'denied') return 'denied' as const
  const result = await Notification.requestPermission()
  return result
}

export async function sendLocalNotification(title: string, body: string, tag = 'jessica-daily') {
  if (!('Notification' in window) || Notification.permission !== 'granted') return false
  try {
    const reg = await navigator.serviceWorker?.ready
    if (reg) {
      await reg.showNotification(title, {
        body,
        icon: `${import.meta.env.BASE_URL}icons/icon-192.png`,
        badge: `${import.meta.env.BASE_URL}icons/icon-192.png`,
        tag,
        data: { url: `${window.location.origin}${window.location.pathname}#/` },
      } as NotificationOptions)
      return true
    }
    new Notification(title, { body, icon: `${import.meta.env.BASE_URL}icons/icon-192.png` })
    return true
  } catch {
    return false
  }
}

/**
 * Fires the daily riddle notification at 16:00 while the PWA is running.
 * True background push needs a server; this is the maximum a 100% static PWA
 * can do without a backend. We also check on every app open after 4 PM.
 */
export function useDailyRiddleNotification(enabled: boolean, onFire: () => void) {
  useEffect(() => {
    if (!enabled) return
    const check = () => {
      const now = new Date()
      const key = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`
      const last = localStorage.getItem('jessica-riddle-notified')
      if (now.getHours() >= 16 && last !== key) {
        localStorage.setItem('jessica-riddle-notified', key)
        onFire()
      }
    }
    check()
    const timer = window.setInterval(check, 5 * 60 * 1000)
    return () => window.clearInterval(timer)
  }, [enabled, onFire])
}

/* --------------------------- PWA registration ----------------------------- */

/**
 * Reload through a fresh URL.
 *
 * GitHub Pages sends `index.html` with `max-age=600`, so a plain reload can
 * serve the same HTML for ten minutes after a deploy — the exact reason an
 * update "does not arrive". A unique `?v=` makes the navigation a new URL and
 * bypasses that cache. `main.tsx` removes the query once the app has booted.
 */
function hardReload() {
  try {
    const url = new URL(window.location.href)
    url.searchParams.set('v', Date.now().toString(36))
    window.location.replace(url.toString())
  } catch {
    window.location.reload()
  }
}

/**
 * A manual check for the Settings screen: it asks the browser for a new worker,
 * then compares version.json. Returns what the UI should say.
 */
export async function checkForUpdate(): Promise<'current' | 'updating' | 'unsupported'> {
  if (!('serviceWorker' in navigator)) return 'unsupported'
  try {
    const reg = await navigator.serviceWorker.getRegistration()
    await reg?.update().catch(() => undefined)
    if (reg?.waiting) {
      reg.waiting.postMessage({ type: 'SKIP_WAITING' })
      window.setTimeout(hardReload, 900)
      return 'updating'
    }
    const response = await fetch(`${import.meta.env.BASE_URL}version.json?ts=${Date.now()}`, { cache: 'no-store' })
    if (!response.ok) return 'unsupported'
    const data = (await response.json()) as { version?: string }
    if (data.version && data.version !== __APP_VERSION__) {
      hardReload()
      return 'updating'
    }
    return 'current'
  } catch {
    return 'unsupported'
  }
}

export function useServiceWorker() {
  const [updateReady, setUpdateReady] = useState(false)
  const regRef = useRef<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    if (import.meta.env.DEV) return
    if (!('serviceWorker' in navigator)) return
    const base = import.meta.env.BASE_URL
    const hadController = !!navigator.serviceWorker.controller
    const launchedAt = Date.now()
    let refreshing = false
    let interval: number | undefined

    const reloadOnce = () => {
      if (refreshing) return
      refreshing = true
      hardReload()
    }

    // A waiting worker means the new bundle is downloaded and ready.
    const onControllerChange = () => {
      if (!hadController) return
      reloadOnce()
    }
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange)

    // The worker check can be bypassed (privacy settings, a stuck cache), so the
    // app also compares the deploy id it was built with against version.json.
    const checkVersion = async () => {
      try {
        const response = await fetch(`${base}version.json?ts=${Date.now()}`, { cache: 'no-store' })
        if (!response.ok) return
        const data = (await response.json()) as { version?: string }
        if (!data.version || data.version === __APP_VERSION__) return

        // On a fresh launch at the home route, update silently instead of
        // asking. Guarded so a broken cache can never reload in a loop.
        const atRoot =
          !window.location.hash || window.location.hash === '#/' || window.location.hash === '#/kids'
        // Never reload over onboarding or the terms screen: a half-filled form
        // matters more than a fresh bundle.
        const booted = (() => {
          try {
            const raw = window.localStorage.getItem('jessica-profile-v1')
            const state = raw ? (JSON.parse(raw) as { state?: { onboarded?: boolean; acceptedTerms?: number } }).state : null
            return Boolean(state?.onboarded && state?.acceptedTerms)
          } catch {
            return false
          }
        })()
        const lastAuto = Number(window.sessionStorage.getItem('jessica-auto-update') || 0)
        if (atRoot && booted && Date.now() - launchedAt < 15_000 && Date.now() - lastAuto > 60_000) {
          window.sessionStorage.setItem('jessica-auto-update', String(Date.now()))
          hardReload()
          return
        }
        setUpdateReady(true)
      } catch {
        /* offline: the update will be noticed when the network returns */
      }
    }

    const onWake = () => {
      if (document.visibilityState !== 'visible') return
      navigator.serviceWorker.getRegistration().then((reg) => reg?.update().catch(() => undefined))
      void checkVersion()
    }
    document.addEventListener('visibilitychange', onWake)
    window.addEventListener('online', onWake)

    navigator.serviceWorker
      .register(`${base}sw.js`, { scope: base, updateViaCache: 'none' })
      .then((reg) => {
        regRef.current = reg
        const check = () => reg.update().catch(() => undefined)
        interval = window.setInterval(check, 15 * 60 * 1000)

        const markWaiting = () => {
          if (reg.waiting && navigator.serviceWorker.controller) setUpdateReady(true)
        }
        reg.addEventListener('updatefound', () => {
          const worker = reg.installing
          worker?.addEventListener('statechange', () => {
            if (worker.state === 'installed') markWaiting()
          })
        })
        markWaiting()
        check()
      })
      .catch(() => undefined)

    void checkVersion()
    const versionTimer = window.setInterval(() => void checkVersion(), 5 * 60 * 1000)

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange)
      document.removeEventListener('visibilitychange', onWake)
      window.removeEventListener('online', onWake)
      if (interval) window.clearInterval(interval)
      if (versionTimer) window.clearInterval(versionTimer)
    }
  }, [])

  const applyUpdate = useCallback(() => {
    const waiting = regRef.current?.waiting
    if (!waiting) {
      hardReload()
      return
    }
    // The waiting worker calls skipWaiting, then controllerchange reloads us.
    waiting.postMessage({ type: 'SKIP_WAITING' })
    // iOS can take a moment to activate; a longer fallback beats a stale reload.
    window.setTimeout(hardReload, 2500)
  }, [])

  return { updateReady, applyUpdate }
}
