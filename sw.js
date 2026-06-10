// 口腔機能管理アプリ Service Worker（オフラインキャッシュ）
const CACHE = "oralfunc-v1";
const ASSETS = ["./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.map(k => k === CACHE ? null : caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(resp => {
      try {
        if (resp && resp.status === 200 && new URL(e.request.url).origin === location.origin) {
          const cl = resp.clone(); caches.open(CACHE).then(c => c.put(e.request, cl));
        }
      } catch (_) {}
      return resp;
    }).catch(() => caches.match("index.html")))
  );
});
