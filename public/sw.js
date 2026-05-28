const VERSION_CACHE = "euronutra-pwa-v1";
const RUTAS_ESTATICAS = [
  "/",
  "/seleccion",
  "/escaneo",
  "/historial",
  "/manifest.webmanifest",
  "/icono-pwa.svg",
  "/login.css",
  "/escaneo.css",
  "/historial.css",
  "/seleccion.css",
  "/lectorController.js",
  "/historial.js",
  "/pwa-register.js"
];

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches.open(VERSION_CACHE).then((cache) => cache.addAll(RUTAS_ESTATICAS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches.keys().then((claves) =>
      Promise.all(
        claves
          .filter((clave) => clave !== VERSION_CACHE)
          .map((clave) => caches.delete(clave))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (evento) => {
  if (evento.request.method !== "GET") return;

  evento.respondWith(
    caches.match(evento.request).then((respuestaCache) => {
      if (respuestaCache) return respuestaCache;

      return fetch(evento.request)
        .then((respuestaRed) => {
          const url = new URL(evento.request.url);
          if (url.origin === self.location.origin) {
            const copia = respuestaRed.clone();
            caches.open(VERSION_CACHE).then((cache) => cache.put(evento.request, copia));
          }
          return respuestaRed;
        })
        .catch(() => caches.match("/"));
    })
  );
});
