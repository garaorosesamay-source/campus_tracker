const CACHE_NAME = "school-supplies-v1";

const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/manifest.json",
    "/css/bootstrap.min.css",
    "/css/style.css",
    "/js/app.js",
    "/logo/arlan192.png",
    "/logo/arlan512.png"
];

self.addEventListener("install", event => {
    console.log("Service Worker: Installing...");

    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("Caching app files...");
            return Promise.all(
                FILES_TO_CACHE.map(url =>
                    cache.add(url).catch(err => {
                        console.warn("Failed to cache:", url, err);
                    })
                )
            );
        })
    );

    self.skipWaiting();
});

self.addEventListener("activate", event => {
    console.log("Service Worker: Activated...");

    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            );
        })
    );

    self.clients.claim();
});

self.addEventListener("fetch", event => {

    if (event.request.method !== "GET") {
        return;
    }

    event.respondWith(
        caches.match(event.request).then(cachedResponse => {

            
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(event.request)
                .then(networkResponse => {
                    
                    return caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                })
                .catch(() => {
                    
                    console.warn("Fetch failed, walang cache at walang net:", event.request.url);
                });

        })
    );

});