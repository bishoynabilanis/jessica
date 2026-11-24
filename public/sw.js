/* Jessica service worker — offline shell + runtime media cache + local notifications */
// The build stamps the deploy id into the line below, so every deploy ships a
// byte-different worker and the browser actually notices the update.
const VERSION = 'jessica-__BUILD__'
const SHELL = `${VERSION}-shell`
const RUNTIME = `${VERSION}-runtime`
const CORE = ['./', './index.html', './manifest.webmanifest', './icons/icon.svg', './mascot/jessica-avatar.webp', './mascot/jessica-face.webp', './mascot/jessica-full.webp']
// The build injects the hashed entry bundles here (index.html references), so
// a first visit can boot with no network even before any route is revisited.
const ASSETS = Array.isArray(self.JESSICA_ASSETS) ? self.JESSICA_ASSETS : []

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      // One-time migration: releases before 5396c11 cannot activate a waiting
      // worker by themselves — their "refresh" button messages the controller
      // instead of the waiter, so those devices would stay old forever. Free
      // them once; activation deletes the old caches, so later installs wait.
      const LEGACY = [
        'jessica-v5',
        'jessica-f1fdf17-',
        'jessica-dd786ba-',
        'jessica-8ea70e6-',
        'jessica-86f72cc-',
      ]
      const keys = await caches.keys()
      const stuckOnOldWorker = keys.some((key) => LEGACY.some((prefix) => key.startsWith(prefix)))
      const cache = await caches.open(SHELL)
      // Parallel with a hard timeout: addAll is atomic and a sequential loop
      // can stall install on a slow CDN, leaving the app with no shell at all.
      await Promise.allSettled(
        [...CORE, ...ASSETS].map(async (url) => {
          const response = await fetch(url, { signal: AbortSignal.timeout(8000) })
          if (response.ok) await cache.put(url, response)
        }),
      )
      if (stuckOnOldWorker) await self.skipWaiting()
    })(),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return

  // Local textbook PDFs & fonts: cache-first for instant offline reading.
  if (url.pathname.includes('/books/') || /\.(woff2?|ttf|otf|png|jpg|jpeg|svg|webp|mjs)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(req, { ignoreVary: true }).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            const copy = res.clone()
            caches.open(RUNTIME).then((c) => c.put(req, copy))
            return res
          }),
      ),
    )
    return
  }

  // The deploy id must be read fresh, never from a cache, or the app compares
  // against yesterday's version and misses today's update.
  if (url.pathname.endsWith('/version.json') || url.pathname.endsWith('/sw.js')) {
    event.respondWith(
      fetch(req, { cache: 'no-store' }).catch(() => caches.match(req, { ignoreVary: true })),
    )
    return
  }

  // Navigations: network-first with offline fallback to the cached shell.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req, { cache: 'no-cache' })
        .then((res) => {
          const copy = res.clone()
          caches.open(SHELL).then((c) => c.put('./index.html', copy))
          return res
        })
        .catch(() => caches.match('./index.html', { ignoreVary: true })),
    )
    return
  }

  // Assets: stale-while-revalidate.
  event.respondWith(
    caches.match(req, { ignoreVary: true }).then((hit) => {
      const network = fetch(req)
        .then((res) => {
          const copy = res.clone()
          caches.open(RUNTIME).then((c) => c.put(req, copy))
          return res
        })
        .catch(() => hit)
      return hit || network
    }),
  )
})

self.addEventListener('message', (event) => {
  const data = event.data || {}
  if (data.type === 'SKIP_WAITING') self.skipWaiting()
  if (data.type === 'NOTIFY' && data.title) {
    self.registration.showNotification(data.title, {
      body: data.body || '',
      icon: './icons/icon-192.png',
      badge: './icons/icon-192.png',
      tag: data.tag || 'jessica-daily',
      data: { url: data.url || './index.html#/' },
      vibrate: [80, 40, 80],
    })
  }
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const target = (event.notification.data && event.notification.data.url) || './index.html#/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ('focus' in client) {
          client.navigate(target)
          return client.focus()
        }
      }
      return clients.openWindow(target)
    }),
  )
})
