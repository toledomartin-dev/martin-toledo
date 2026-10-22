// Service worker: la segunda visita carga al instante y el sitio se puede leer sin conexión.
// - /_astro/* (nombres con hash, nunca cambian): primero la caché.
// - Datos del mapa, imágenes, íconos y PDF: la caché responde y de fondo se actualiza.
// - Páginas: primero la red (para ver siempre lo último) y, sin conexión, la última copia guardada.
// Cambiar VERSION borra todo lo guardado en la próxima visita.
const VERSION = 'v1';
const STATIC = `static-${VERSION}`;
const PAGES = `pages-${VERSION}`;
const MAX_STATIC = 120; // los deploys dejan archivos con hash viejos: se borran los más antiguos

self.addEventListener('install', (event) => {
  // El mapa de Córdoba se guarda de entrada: es lo que pide el hero apenas arranca
  event.waitUntil(
    caches
      .open(STATIC)
      .then((cache) => cache.addAll(['/data/cordoba-points.bin', '/data/cordoba-routes.json']))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== STATIC && k !== PAGES).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

const trim = async (name, max) => {
  const cache = await caches.open(name);
  const keys = await cache.keys();
  await Promise.all(keys.slice(0, Math.max(0, keys.length - max)).map((k) => cache.delete(k)));
};

const put = async (name, request, response) => {
  if (!response.ok || response.type !== 'basic') return;
  const cache = await caches.open(name);
  await cache.put(request, response);
  if (name === STATIC) await trim(STATIC, MAX_STATIC);
};

const cacheFirst = async (event) => {
  const cached = await caches.match(event.request);
  if (cached) return cached;
  const response = await fetch(event.request);
  event.waitUntil(put(STATIC, event.request, response.clone()));
  return response;
};

const staleWhileRevalidate = async (event) => {
  const cached = await caches.match(event.request);
  const network = fetch(event.request).then((response) => {
    event.waitUntil(put(STATIC, event.request, response.clone()));
    return response;
  });
  if (cached) {
    event.waitUntil(network.catch(() => {}));
    return cached;
  }
  return network;
};

const networkFirst = async (event) => {
  try {
    const response = await fetch(event.request);
    event.waitUntil(put(PAGES, event.request, response.clone()));
    return response;
  } catch (error) {
    const cached = (await caches.match(event.request)) || (await caches.match('/404.html'));
    if (cached) return cached;
    throw error;
  }
};

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  // Rangos (video, PDF parcial) y el propio service worker van directo a la red
  if (request.headers.has('range') || url.pathname === '/sw.js') return;

  if (request.mode === 'navigate') return event.respondWith(networkFirst(event));
  if (url.pathname.startsWith('/_astro/')) return event.respondWith(cacheFirst(event));
  if (/\.(bin|json|avif|webp|jpe?g|png|svg|ico|pdf|webmanifest|woff2)$/.test(url.pathname)) {
    return event.respondWith(staleWhileRevalidate(event));
  }
});
