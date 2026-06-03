const VERSION_CACHE = "euronutra-pwa-v2";
const RUTAS_ESTATICAS = [
  "/manifest.webmanifest",
  "/icono-pwa.svg",
  "/login.css",
  "/escaneo.css",
  "/historial.css",
  "/productos.css",
  "/seleccion.css",
  "/crear-producto.css",
  "/lectorController.js",
  "/historial.js",
  "/pwa-register.js"
];

// Instala el service worker y cachea los recursos estáticos
self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches.open(VERSION_CACHE).then((cache) => cache.addAll(RUTAS_ESTATICAS))
  );
  self.skipWaiting();
});

// Elimina caches antiguas al activar el nuevo service worker
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

// Función para determinar si la solicitud es para un recurso estático
function esActivoEstatico(request) {
  return [
    ".css",
    ".js",
    ".webmanifest",
    ".svg",
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".ico"
  ].some((ext) => request.url.endsWith(ext));
}

// Intercepta las solicitudes de red
self.addEventListener("fetch", (evento) => {
  if (evento.request.method !== "GET") return;

  const url = new URL(evento.request.url);

  if (evento.request.mode === "navigate" || evento.request.headers.get("accept")?.includes("text/html")) {
    evento.respondWith(
      fetch(evento.request)
        .then((respuestaRed) => {
          return respuestaRed;
        })
        .catch(() => caches.match(evento.request).then((respuestaCache) => respuestaCache || caches.match("/")))
    );
    return;
  }

  if (esActivoEstatico(evento.request)) {
    evento.respondWith(
      caches.match(evento.request).then((respuestaCache) => {
        if (respuestaCache) return respuestaCache;

        return fetch(evento.request).then((respuestaRed) => {
          const copia = respuestaRed.clone();
          caches.open(VERSION_CACHE).then((cache) => cache.put(evento.request, copia));
          return respuestaRed;
        });
      })
    );
    return;
  }

  evento.respondWith(fetch(evento.request).catch(() => caches.match(evento.request)));
});
