/* Jessica service worker — offline shell + runtime media cache + local notifications */
const VERSION = 'jessica-v4'
const SHELL = `${VERSION}-shell`
const RUNTIME = `${VERSION}-runtime`
const CORE = ['./', './index.html', './manifest.webmanifest', './icons/icon.svg', './mascot/jessica-avatar.png', './mascot/jessica-face.png', './mascot/jessica-full.png']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL).then((cache) => cache.addAll(CORE).catch(() => undefined)).then(() => self.skipWaiting()),
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
      caches.match(req).then(
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

  // Navigations: network-first with offline fallback to the cached shell.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone()
          caches.open(SHELL).then((c) => c.put('./index.html', copy))
          return res
        })
        .catch(() => caches.match('./index.html')),
    )
    return
  }

  // Assets: stale-while-revalidate.
  event.respondWith(
    caches.match(req).then((hit) => {
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
