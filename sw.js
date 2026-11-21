
const CACHE_NAME = "arcanis-energy-v05";

const APP_FILES = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",

  "./assets/mark-01.png",
  "./assets/mark-02.png",
  "./assets/mark-03.png",
  "./assets/mark-04.png",
  "./assets/mark-05.png",
  "./assets/mark-06.png",
  "./assets/mark-07.png",
  "./assets/mark-08.png",
  "./assets/mark-09.png",
  "./assets/mark-10.png",
  "./assets/mark-11.png",
  "./assets/mark-12.png",
  "./assets/mark-13.png",
  "./assets/mark-14.png",
  "./assets/mark-15.png"
];

// INSTALL
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_FILES);
    })
  );

  self.skipWaiting();
});

// ACTIVATE
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );

  self.clients.claim();
});

// FETCH
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request);
    })
  );
});
