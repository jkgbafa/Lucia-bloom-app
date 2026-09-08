// Bloom Service Worker - Handles background push notifications
const CACHE_NAME = 'bloom-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Handle push events from Firebase Cloud Messaging (future)
self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json();
  const options = {
    body: data.body || 'Bloom update',
    icon: '/icon.svg',
    badge: '/icon.svg',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/' },
    actions: [
      { action: 'open', title: 'Open Bloom' },
    ]
  };
  event.waitUntil(
    self.registration.showNotification(data.title || 'Bloom', options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});

// Handle background sync for scheduled local notifications
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATIONS') {
    const { notifications } = event.data;
    notifications.forEach((notif) => {
      const delay = notif.timestamp - Date.now();
      if (delay > 0 && delay < 86400000 * 2) { // Within 2 days
        setTimeout(() => {
          self.registration.showNotification(notif.title, {
            body: notif.body,
            icon: '/icon.svg',
            badge: '/icon.svg',
            vibrate: [200, 100, 200],
          });
        }, delay);
      }
    });
  }
});
