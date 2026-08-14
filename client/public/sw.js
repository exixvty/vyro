const CACHE_NAME = "vyro-v3";
const RUNTIME_CACHE = "vyro-runtime-v3";
const OFFLINE_URL = "/";

const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker...");

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Caching essential files");
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== CACHE_NAME &&
              cacheName !== RUNTIME_CACHE
            ) {
              console.log("[SW] Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }

            return undefined;
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  // Never cache non-GET API requests.
  if (url.pathname.startsWith("/api/")) {
    if (request.method !== "GET") {
      return;
    }

    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const responseToCache = response.clone();

            caches
              .open(RUNTIME_CACHE)
              .then((cache) => cache.put(request, responseToCache))
              .catch((error) =>
                console.warn("[SW] API cache failed:", error)
              );
          }

          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) => {
            return cached || new Response("Offline", { status: 503 });
          })
        )
    );

    return;
  }

  // Static assets: cache first, then network.
  if (
    request.destination === "image" ||
    request.destination === "font" ||
    request.destination === "style" ||
    request.destination === "script"
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          return cached;
        }

        return fetch(request)
          .then((response) => {
            if (response.ok) {
              const responseToCache = response.clone();

              caches
                .open(RUNTIME_CACHE)
                .then((cache) => cache.put(request, responseToCache))
                .catch((error) =>
                  console.warn("[SW] Asset cache failed:", error)
                );
            }

            return response;
          })
          .catch(() => {
            if (request.destination === "image") {
              return new Response(
                `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="#333" width="100" height="100"/></svg>`,
                {
                  headers: {
                    "Content-Type": "image/svg+xml",
                  },
                }
              );
            }

            return new Response("Offline", { status: 503 });
          });
      })
    );

    return;
  }

  // HTML navigation: network first, cached fallback.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const responseToCache = response.clone();

            caches
              .open(RUNTIME_CACHE)
              .then((cache) => cache.put(request, responseToCache))
              .catch((error) =>
                console.warn("[SW] Navigation cache failed:", error)
              );
          }

          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) => {
            return cached || caches.match(OFFLINE_URL);
          })
        )
    );

    return;
  }

  // Everything else: network first, cached fallback.
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const responseToCache = response.clone();

          caches
            .open(RUNTIME_CACHE)
            .then((cache) => cache.put(request, responseToCache))
            .catch((error) =>
              console.warn("[SW] Runtime cache failed:", error)
            );
        }

        return response;
      })
      .catch(() =>
        caches.match(request).then((cached) => {
          return cached || new Response("Offline", { status: 503 });
        })
      )
  );
});

// Push notifications
self.addEventListener("push", (event) => {
  console.log("[SW] Push received");

  let data = {
    title: "VYRO",
    body: "Time to crush your goals! 🔥",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: "vyro-notification",
    data: {},
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag,
    data: data.data,
    vibrate: [100, 50, 100],
    actions:
      Array.isArray(data.actions) && data.actions.length > 0
        ? data.actions
        : [
            { action: "open", title: "Open VYRO 🔥" },
            { action: "dismiss", title: "Dismiss" },
          ],
    requireInteraction: false,
    silent: false,
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked:", event.action);

  event.notification.close();

  if (event.action === "dismiss") {
    return;
  }

  const notifData = event.notification.data || {};
  let targetUrl = "/dashboard";

  if (event.action === "log_urge" && notifData.logUrgeUrl) {
    targetUrl = notifData.logUrgeUrl;
  } else if (event.action === "support" && notifData.supportUrl) {
    targetUrl = notifData.supportUrl;
  } else if (notifData.url) {
    targetUrl = notifData.url;
  } else if (notifData.type === "workout") {
    targetUrl = "/workout";
  } else if (notifData.type === "habit") {
    targetUrl = "/habits";
  } else if (notifData.type === "streak") {
    targetUrl = "/dashboard";
  }

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {
        for (const client of clientList) {
          if (
            client.url.startsWith(self.location.origin) &&
            "focus" in client
          ) {
            client.focus();
            client.postMessage({
              type: "NOTIFICATION_CLICK",
              url: targetUrl,
            });
            return;
          }
        }

        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }

        return undefined;
      })
  );
});

// Background sync hook
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-workouts") {
    event.waitUntil(
      Promise.resolve().then(() => {
        console.log("[SW] Workout sync triggered");
      })
    );
  }
});

// Messages from clients
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data?.type === "CACHE_URLS") {
    const { urls } = event.data;

    if (Array.isArray(urls)) {
      caches
        .open(RUNTIME_CACHE)
        .then((cache) => cache.addAll(urls))
        .catch((error) =>
          console.warn("[SW] Failed to cache requested URLs:", error)
        );
    }
  }
});

console.log("[SW] VYRO service worker v3 loaded");