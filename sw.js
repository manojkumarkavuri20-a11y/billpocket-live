/* BillPocket service worker — offline shell cache.
 * The app is fully local (localStorage only), so we just cache the shell,
 * the JS/CSS modules, the manifest, and the icon set. On activation, older
 * versioned caches are deleted.
 */

const CACHE = "billpocket-shell-v20260624-transfers1";
const VERSION = "v=20260624-transfers1";
const SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon.svg",
  "./icons/icon-maskable.svg",
  "./icons/favicon.svg",
  `./styles.css?${VERSION}`,
  `./js/constants.js?${VERSION}`,
  `./js/dom.js?${VERSION}`,
  `./js/utils.js?${VERSION}`,
  `./js/storage.js?${VERSION}`,
  `./js/statement-parser.js?${VERSION}`,
  `./js/statement-analysis.js?${VERSION}`,
  `./js/account.js?${VERSION}`,
  `./js/transactions.js?${VERSION}`,
  `./js/charts.js?${VERSION}`,
  `./js/planning.js?${VERSION}`,
  `./js/simulator.js?${VERSION}`,
  `./js/bills.js?${VERSION}`,
  `./js/ui.js?${VERSION}`,
  `./js/app.js?${VERSION}`,
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll(SHELL.map((url) => new Request(url, { cache: "reload" })))
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith("billpocket-shell-") && k !== CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  // Cache-first for the app shell; network-first fallback.
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((response) => {
          if (response.ok && new URL(req.url).origin === self.location.origin) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(req, copy)).catch(() => {});
          }
          return response;
        })
        .catch(() => cached);
    })
  );
});
