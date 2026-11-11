import { useEffect, useRef, useState } from 'react'

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
export function useServiceWorker() {
  const [updateReady, setUpdateReady] = useState(false)

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    const base = import.meta.env.BASE_URL
    const hadController = !!navigator.serviceWorker.controller
    let refreshing = false
    let interval: number | undefined

    // When a new service worker takes control, reload once so the new bundle runs.
    const onControllerChange = () => {
      if (!hadController || refreshing) return
      refreshing = true
      window.location.reload()
    }
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange)

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        navigator.serviceWorker.getRegistration().then((reg) => reg?.update().catch(() => undefined))
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    navigator.serviceWorker
      .register(`${base}sw.js`, { scope: base, updateViaCache: 'none' })
      .then((reg) => {
        const check = () => reg.update().catch(() => undefined)
        interval = window.setInterval(check, 30 * 60 * 1000)
        reg.addEventListener('updatefound', () => {
          const worker = reg.installing
          worker?.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) setUpdateReady(true)
          })
        })
        check()
      })
      .catch(() => undefined)

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange)
      document.removeEventListener('visibilitychange', onVisibility)
      if (interval) window.clearInterval(interval)
    }
  }, [])

  return {
    updateReady,
    applyUpdate: () => {
      navigator.serviceWorker?.controller?.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
    },
  }
}
