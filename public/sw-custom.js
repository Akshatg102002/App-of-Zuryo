// Custom Service Worker logic for PWA capabilities

// 1. Push Notifications
self.addEventListener('push', (event) => {
  let data = { title: 'Zuryo', body: 'New updates available!' };
  if (event.data) {
    try {
        data = event.data.json();
    } catch(e) {
        data.body = event.data.text();
    }
  }
  const options = {
    body: data.body,
    icon: 'https://i.ibb.co/JRS0NMMj/ZUL.png',
    badge: 'https://i.ibb.co/JRS0NMMj/ZUL.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

// 2. Notification Click Handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        return client.focus();
      }
      return clients.openWindow('/');
    })
  );
});

// 3. Periodic Sync
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'content-sync') {
    console.log('Periodic sync triggered for content-sync');
    // Logic to update cache in background would go here
  }
});

// 4. Background Sync (Fallback if not handled by Workbox config)
self.addEventListener('sync', (event) => {
    if (event.tag === 'api-queue') {
        console.log('Background sync triggered');
    }
});