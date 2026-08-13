const CACHE_NAME = 'vyro-v2';
const RUNTIME_CACHE = 'vyro-runtime-v2';
const OFFLINE_URL = '/';

// Files to cache on install (essential app shell)
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching essential files');
      return cache.addAll(PRECACHE_URLS);
    }).then(() => {
      self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      self.clients.claim();
    })
  );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Handle API requests differently
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const cache = caches.open(RUNTIME_CACHE);
            cache.then((c) => c.put(request, response.clone()));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            if (cached) return cached;
            return caches.match(OFFLINE_URL);
          });
        })
    );
    return;
  }

  // Handle static assets - cache first
  if (
    request.destination === 'image' ||
    request.destination === 'font' ||
    request.destination === 'style' ||
    request.destination === 'script'
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const cache = caches.open(RUNTIME_CACHE);
            cache.then((c) => c.put(request, response.clone()));
          }
          return response;
        }).catch(() => {
          if (request.destination === 'image') {
            return new Response(
              '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="#333" width="100" height="100"/></svg>',
              { headers: { 'Content-Type': 'image/svg+xml' } }
            );
          }
          return new Response('Offline', { status: 503 });
        });
      })
    );
    return;
  }

  // Handle HTML documents - network first
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const cache = caches.open(RUNTIME_CACHE);
            cache.then((c) => c.put(request, response.clone()));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            if (cached) return cached;
            return caches.match(OFFLINE_URL);
          });
        })
    );
    return;
  }

  // Default: network first
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const cache = caches.open(RUNTIME_CACHE);
          cache.then((c) => c.put(request, response.clone()));
        }
        return response;
      })
      .catch(() => {
        return caches.match(request).then((cached) => {
          return cached || new Response('Offline', { status: 503 });
        });
      })
  );
});

// ── Push Notification Handler ─────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  console.log('[SW] Push received');

  let data = {
    title: 'VYRO',
    body: 'Time to crush your goals! 🔥',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'vyro-notification',
    data: {},
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    } catch (e) {
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
    actions: Array.isArray(data.actions) && data.actions.length > 0
      ? data.actions
      : [
          { action: 'open', title: 'Open VYRO 🔥' },
          { action: 'dismiss', title: 'Dismiss' },
        ],
    requireInteraction: false,
    silent: false,
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// ── Notification Click Handler ────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  event.notification.close();

  if (event.action === 'dismiss') return;

  // Determine URL to open based on notification data
  const notifData = event.notification.data || {};
  let targetUrl = '/dashboard';

  if (event.action === 'log_urge' && notifData.logUrgeUrl) {
    targetUrl = notifData.logUrgeUrl;
  } else if (event.action === 'support' && notifData.supportUrl) {
    targetUrl = notifData.supportUrl;
  } else if (notifData.url) {
    targetUrl = notifData.url;
  } else if (notifData.type === 'workout') {
    targetUrl = '/workout';
  } else if (notifData.type === 'habit') {
    targetUrl = '/habits';
  } else if (notifData.type === 'streak') {
    targetUrl = '/dashboard';
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.postMessage({ type: 'NOTIFICATION_CLICK', url: targetUrl });
          return;
        }
      }
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-workouts') {
    event.waitUntil(
      caches.open(RUNTIME_CACHE).then((cache) => {
        console.log('[SW] Syncing workouts...');
      })
    );
  }
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CACHE_URLS') {
    const { urls } = event.data;
    caches.open(RUNTIME_CACHE).then((cache) => {
      cache.addAll(urls);
    });
  }
});

console.log('[SW] Service worker v2 loaded with push notification support');
