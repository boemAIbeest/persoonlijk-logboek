// Service worker voor Persoonlijk logboek: laat de app ook zonder internet openen.
// Strategie: eerst het netwerk (zo krijg je altijd de nieuwste versie), en als dat
// niet lukt of te lang duurt de laatst bewaarde kopie. Er wordt alleen de app zelf
// bewaard, nooit je notities en nooit verkeer naar GitHub.
const CACHE = 'logboek-v1';
const TIMEOUT_MS = 4000;

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(c => c.add('./')).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  // Alleen de eigen bestanden van de app; al het andere (api.github.com) gaat er gewoon langs.
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  const fromCache = () => caches.match(req, { ignoreSearch: true }).then(hit => hit || caches.match('./'));
  const fromNetwork = fetch(req).then(res => {
    if (res.ok) {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy));
    }
    return res;
  });
  const timeout = new Promise(resolve => setTimeout(resolve, TIMEOUT_MS)).then(fromCache);

  event.respondWith(
    Promise.race([fromNetwork.catch(fromCache), timeout])
      .then(res => res || fromNetwork) // geen kopie beschikbaar: toch op het netwerk wachten
  );
});
