const CACHE_NAME = 'pre-buildup-voca-v2';
const OFFLINE_URL = '/';

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/noise.svg',
  '/media/sounds/correct.mp3',
  '/media/sounds/wrong.ogg',
  '/media/sounds/click.ogg',
  '/media/sounds/level_up.mp3',
];

const STATIC_CACHE_PATHS = [
  '/icons/',
  '/media/',
  '/noise.svg',
  '/manifest.json',
];

function isSameOrigin(url) {
  return url.origin === self.location.origin;
}

function isNavigationRequest(request) {
  return request.mode === 'navigate' || request.destination === 'document';
}

function isNextAsset(pathname) {
  return pathname.startsWith('/_next/');
}

function isApiRequest(pathname) {
  return pathname.startsWith('/api/');
}

function shouldUseStaticCache(pathname) {
  return STATIC_CACHE_PATHS.some((prefix) => pathname === prefix || pathname.startsWith(prefix));
}

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Precaching assets');
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
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

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip chrome-extension and other non-http(s) requests
  if (!event.request.url.startsWith('http')) return;

  const requestUrl = new URL(event.request.url);

  // Never intercept cross-origin requests such as YouTube embeds.
  if (!isSameOrigin(requestUrl)) return;

  // Let Next.js handle framework assets and APIs directly to avoid stale app code.
  if (isNextAsset(requestUrl.pathname) || isApiRequest(requestUrl.pathname)) return;

  // Navigation should prefer fresh network responses; fall back to offline shell only when needed.
  if (isNavigationRequest(event.request)) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            event.waitUntil(
              caches.open(CACHE_NAME).then((cache) => cache.put(OFFLINE_URL, responseClone))
            );
          }
          return response;
        })
        .catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  if (!shouldUseStaticCache(requestUrl.pathname)) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached response and update cache in background
        event.waitUntil(
          fetch(event.request).then((response) => {
            if (response && response.status === 200 && response.type === 'basic') {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseClone);
              });
            }
          }).catch(() => {})
        );
        return cachedResponse;
      }

      // Not in cache, fetch from network
      return fetch(event.request)
        .then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Cache the fetched response
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });

          return response;
        })
        .catch(() => {
          return new Response('Offline', { status: 503 });
        });
    })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title || 'Pre-Build Up Voca';
  const options = {
    body: data.body || '오늘의 단어 학습을 시작해볼까요?',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: 'study-reminder',
    renotify: true,
    data: {
      url: data.url || '/',
    },
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If app is already open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise, open new window
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data?.url || '/');
      }
    })
  );
});

// Background sync for offline actions (future use)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-quiz-results') {
    event.waitUntil(syncQuizResults());
  }
});

async function syncQuizResults() {
  // Placeholder for future offline sync implementation
  console.log('[SW] Syncing quiz results...');
}

// Periodic background sync for scheduled notifications
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'study-reminder') {
    event.waitUntil(checkAndSendReminder());
  }
});

async function checkAndSendReminder() {
  // Check if user should receive notification
  // This runs periodically in background
  const title = 'Pre-Build Up Voca';
  const body = '📚 오늘의 단어 학습을 시작해볼까요?';

  await self.registration.showNotification(title, {
    body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: 'study-reminder',
    renotify: true,
  });
}
