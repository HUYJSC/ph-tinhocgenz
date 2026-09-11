// PH DIGITAL EDUCATION — Advanced PWA Service Worker (v5-live)
// Nâng cấp: Network-First cho Navigation (luôn tải code mới nhất) + Offline Fallback + Purge V4 Cache
const CACHE_NAME = 'ph-eduquest-v5-live';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo.png',
  '/icon-192.png',
  '/icon.png',
  '/apple-touch-icon.png'
];

// ── INSTALL ──
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Pre-cache warning:', err);
      });
    })
  );
  self.skipWaiting();
});

// ── ACTIVATE: Xóa sạch toàn bộ cache cũ ──
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// ── FETCH STRATEGY ──
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // Không cache các endpoint API backend hoặc các trang quản trị nhạy cảm (SEC-P1-02)
  const isPrivateOrApi = 
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/teacher') ||
    url.pathname.startsWith('/academic') ||
    url.pathname.startsWith('/auth') ||
    url.pathname.startsWith('/attendance') ||
    url.pathname.startsWith('/schedule');

  if (isPrivateOrApi) {
    return;
  }

  // 1. Navigation / HTML: Network-First (Luôn lấy mã nguồn mới nhất từ Vercel, offline mới fallback về cache)
  if (event.request.mode === 'navigate' || url.pathname === '/' || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match('/index.html');
        })
    );
    return;
  }

  // 2. Static Assets (JS, CSS có hash, hình ảnh): Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});

// ── WEB PUSH: Nhận thông báo push từ server ──
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = {
      title: 'PH Digital Education',
      body: event.data.text(),
      icon: '/icon-192.png',
      badge: '/logo.png'
    };
  }

  const title = payload.title || 'PH Digital Education';
  const options = {
    body: payload.body || 'Bạn có thông báo mới từ Trung tâm.',
    icon: payload.icon || '/icon-192.png',
    badge: payload.badge || '/logo.png',
    image: payload.image || undefined,
    tag: payload.tag || `ph-notif-${Date.now()}`,
    renotify: true,
    requireInteraction: payload.requireInteraction || false,
    vibrate: [200, 100, 200],
    data: {
      url: payload.url || '/',
      notificationId: payload.notificationId || null,
      type: payload.type || 'system'
    },
    actions: payload.actions || [
      { action: 'open', title: '📖 Xem chi tiết' },
      { action: 'dismiss', title: '✕ Bỏ qua' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// ── WEB PUSH: Xử lý khi người dùng click vào thông báo ──
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const action = event.action;
  const data = event.notification.data || {};

  if (action === 'dismiss') return;

  // Mở app hoặc focus nếu đã mở
  const targetUrl = data.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Nếu đã có tab mở → focus và navigate
      for (const client of windowClients) {
        if (client.url.includes(self.registration.scope)) {
          client.focus();
          client.postMessage({
            type: 'NOTIFICATION_CLICKED',
            notificationId: data.notificationId,
            url: targetUrl
          });
          return;
        }
      }
      // Nếu chưa có tab → mở mới
      return self.clients.openWindow(targetUrl);
    })
  );
});

// ── WEB PUSH: Xử lý khi người dùng đóng thông báo (không click) ──
self.addEventListener('notificationclose', (event) => {
  const data = event.notification.data || {};
  // Gửi analytics nếu cần
  if (data.notificationId) {
    // Có thể gọi API đánh dấu dismissed nếu cần tracking
    console.log('[SW] Notification dismissed:', data.notificationId);
  }
});
