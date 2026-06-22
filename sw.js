/* BillPocket service worker — offline shell cache.
 * The app is fully local (localStorage only), so we just cache the shell
 * and the JS/CSS modules. On activation, old versioned caches are deleted.
 */

const CACHE = "billpocket-shell-v20260622-slate1";
const SHELL = [
  "./",
  "./index.html",
  "./styles.css?v=20260622-slate1",
  "./manifest.webmanifest",
  "./js/constants.js?v=20260622-slate1",
  "./js/dom.js?v=20260622-slate1",
  "./js/utils.js?v=20260622-slate1",
  "./js/storage.js?v=20260622-slate1",
  "./js/statement-parser.js?v=20260622-slate1",
  "./js/statement-analysis.js?v=20260622-slate1",
  "./js/account.js?v=20260622-slate1",
  "./js/transactions.js?v=20260622-slate1",
  "./js/charts.js?v=20260622-slate1",
  "./js/planning.js?v=20260622-slate1",
  "./js/simulator.js?v=20260622-slate1",
  "./js/bills.js?v=20260622-slate1",
  "./js/ui.js?v=20260622-slate1",
  "./js/app.js?v=20260622-slate1",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL.map((url) => new Request(url, { cache: "reload" }))))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k.startsWith("billpocket-shell-") && k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  // Cache-first for app shell; network-first for everything else.
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
