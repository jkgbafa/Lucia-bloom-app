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

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon.svg',
    badge: '/icon.svg',
    vibrate: [200, 100, 200]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Also keep our local scheduled notifications working
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATIONS') {
    const { notifications } = event.data;
    notifications.forEach((notif) => {
      const delay = notif.timestamp - Date.now();
      if (delay > 0 && delay < 86400000 * 2) { 
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
