// Service worker: guarda l'app perquè funcioni sense connexió (p. ex. en un aplec).
// Canvia VERSIO cada cop que publiquis canvis perquè els mòbils s'actualitzin.
const VERSIO = "sardana-v3";
const FITXERS = ["./", "index.html", "app.js", "dades.js", "manifest.webmanifest",
                 "icona.svg", "icona-192.png", "icona-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSIO).then((c) => c.addAll(FITXERS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys()
    .then((claus) => Promise.all(claus.filter((k) => k !== VERSIO).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Primer la xarxa (per tenir sempre l'última versió); si no n'hi ha, la còpia guardada.
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then((r) => { const copia = r.clone(); caches.open(VERSIO).then((c) => c.put(e.request, copia)); return r; })
      .catch(() => caches.match(e.request))
  );
});
