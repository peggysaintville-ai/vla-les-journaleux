// Service Worker pour l'installation PWA V'là Les Journaleux
const CACHE_NAME = "vlalesjournaleux-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Handler fetch satisfaisant aux critères d'installation PWA de Chromium (Chrome / Edge)
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
