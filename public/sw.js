// Service Worker pour l'installation PWA V'là Les Journaleux
const CACHE_NAME = "vlalesjournaleux-v2";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // 1. Ignorer impérativement toutes les requêtes non-GET (POST, PUT, DELETE, PATCH, etc.)
  if (req.method !== "GET") {
    return;
  }

  const url = new URL(req.url);

  // 2. Ignorer expressément les routes d'API (dont /api/upload Vercel Blob)
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // 3. Ignorer les Server Actions Next.js et les flux RSC dynamiques
  if (
    req.headers.get("next-action") ||
    req.headers.get("x-action") ||
    url.searchParams.has("_rsc")
  ) {
    return;
  }

  // 4. Ignorer les requêtes d'extension de navigateur ou protocoles non HTTP/HTTPS
  if (!url.protocol.startsWith("http")) {
    return;
  }

  // 5. Pour les requêtes GET restantes : tentative réseau avec repli propre sans renvoyer undefined
  event.respondWith(
    fetch(req).catch(async () => {
      try {
        const cached = await caches.match(req);
        if (cached) {
          return cached;
        }
      } catch (e) {
        // En cas d'erreur de lecture du cache
      }

      // Réponse de secours garantie pour éviter "TypeError: Failed to convert value to Response"
      return new Response("Contenu temporairement inaccessible hors-ligne", {
        status: 503,
        statusText: "Service Unavailable",
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    })
  );
});
