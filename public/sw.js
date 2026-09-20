// PH DIGITAL EDUCATION — Advanced PWA Service Worker (v6-2026-production)
// Nâng cấp: Network-First cho toàn bộ HTML, JS, CSS (luôn tải code mới nhất từ Vercel) + Purge V5 Cache
const CACHE_NAME = 'ph-eduquest-v6-2026-production';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo.png',
  '/logo-icon.png',
  '/icon-192.png',
  '/icon.png',
  '/apple-touch-icon.png'
];

// ── INSTALL: Kích hoạt ngay lập tức không chờ phiên cũ kết thúc ──
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Pre-cache warning:', err);
      });
    })
  );
});

// ── ACTIVATE: Xóa sạch toàn bộ cache cũ (bao gồm v5-live) ──
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
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

  // 1. Navigation / HTML / JS / CSS: Network-First (Luôn lấy mã nguồn mới nhất từ Vercel)
  // Chỉ khi offline không có mạng mới fallback về cache
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (event.request.mode === 'navigate' || url.pathname.endsWith('.html')) {
            return caches.match('/index.html');
          }
          return new Response('Network error and no cache available', { status: 503 });
        });
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
    body: payload.body || 'Bạn có thông báo mới từ hệ thống học tập.',
    icon: payload.icon || '/icon-192.png',
    badge: payload.badge || '/logo.png',
    data: {
      url: payload.url || '/'
    }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// ── NOTIFICATION CLICK: Mở trang tương ứng ──
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
