const CACHE = "king-diadem-v2"

const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json"
]

// INSTALL
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

// ACTIVATE
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(k => {
          if (k !== CACHE) return caches.delete(k)
        })
      )
    )
  )
  self.clients.claim()
})

// FETCH (SMART)
self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(res => {

      // 1. cache first
      if (res) return res

      // 2. network + cache
      return fetch(e.request).then(net => {
        return caches.open(CACHE).then(cache => {
          cache.put(e.request, net.clone())
          return net
        })
      }).catch(() => {
        // 3. fallback
        return caches.match("/index.html")
      })

    })
  )
})
