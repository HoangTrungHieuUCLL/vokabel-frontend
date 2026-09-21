// Push-only service worker: no fetch handler, so nothing is cached or served
// offline. It exists because iOS refuses web push to a site that has no
// service worker, and because a push event has to be handled somewhere
// outside the page.

self.addEventListener('install', () => {
  // Take over straight away instead of waiting for every tab to close --
  // enabling notifications should work on the first try.
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event) => {
  let payload = {}
  try {
    payload = event.data ? event.data.json() : {}
  } catch {
    payload = { title: 'Vokabel', body: event.data ? event.data.text() : '' }
  }

  const title = payload.title || 'Vokabel'
  const body = [payload.body, payload.example].filter(Boolean).join('\n')

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      // One tag for every spotlight, so a phone that was offline shows the
      // current word rather than a stack of stale ones.
      tag: payload.tag || 'vokabel-spotlight',
      renotify: true,
      data: { url: payload.url || '/' },
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const target = (event.notification.data && event.notification.data.url) || '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Reuse an already-open window where possible; on iOS a second window
      // would otherwise cold-start the whole app.
      for (const client of clients) {
        if ('focus' in client) {
          if ('navigate' in client) {
            return client.navigate(target).then((c) => (c || client).focus())
          }
          return client.focus()
        }
      }
      return self.clients.openWindow(target)
    }),
  )
})
