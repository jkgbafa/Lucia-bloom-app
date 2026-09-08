importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyC160Jf-awWqnR1oLcWWTnOWTsN8jteeSc",
  authDomain: "bloom-app-3ea31.firebaseapp.com",
  projectId: "bloom-app-3ea31",
  storageBucket: "bloom-app-3ea31.firebasestorage.app",
  messagingSenderId: "1053761782637",
  appId: "1:1053761782637:web:ec0800bcc0d37d91e81064",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// The SW may live at the domain root (Netlify) or under a subpath (GitHub Pages);
// resolve everything relative to where this file is served from.
const BASE = new URL('./', self.location).pathname;

messaging.onBackgroundMessage((payload) => {
  const title = (payload.notification && payload.notification.title) || 'Bloom';
  self.registration.showNotification(title, {
    body: payload.notification && payload.notification.body,
    icon: BASE + 'icons/icon-192.png',
    badge: BASE + 'icons/icon-192.png',
    vibrate: [200, 100, 200],
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      const existing = clientList.find((c) => 'focus' in c);
      if (existing) return existing.focus();
      if (clients.openWindow) return clients.openWindow(BASE);
    })
  );
});

// --- Offline support: cache app shell and static assets ---
const CACHE_NAME = 'bloom-cache-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;

  // App navigation: network first so updates arrive, cached shell when offline
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return res;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match(BASE)))
    );
    return;
  }

  // Hashed static assets and icons: cache first (they never change under the same URL)
  if (url.pathname.includes('/_next/static/') || url.pathname.startsWith(BASE + 'icons/') || url.pathname === BASE + 'manifest.json') {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return res;
        });
      })
    );
  }
});
