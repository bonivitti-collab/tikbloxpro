/**
 * TIKBLOX PWA Push Notification & Service Worker Event Handler
 * Manages push events, OS system notifications, badges, and user click handling.
 */

self.addEventListener('push', (event) => {
  let payload = {};
  if (event.data) {
    try {
      payload = event.data.json();
    } catch {
      payload = { title: 'Radar TIKBLOX', body: event.data.text() };
    }
  }

  const title = payload.title || '🚨 Radar TIKBLOX: Novo Produto Viral!';
  const options = {
    body: payload.body || 'Um novo produto com alta margem internacional foi identificado pelo radar!',
    icon: payload.icon || '/pwa-192x192.png',
    badge: payload.badge || '/pwa-192x192.png',
    image: payload.image || undefined,
    vibrate: [250, 100, 250, 100, 250],
    tag: payload.tag || `tikblox-alert-${Date.now()}`,
    renotify: true,
    requireInteraction: true,
    data: payload.data || {
      url: payload.url || '/',
      productId: payload.productId || null,
      timestamp: Date.now(),
    },
    actions: [
      {
        action: 'view_product',
        title: '🔥 Ver Produto no Radar',
      },
      {
        action: 'dismiss',
        title: 'Dispensar',
      },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const notificationData = event.notification.data || {};
  const productId = notificationData.productId;
  const targetUrl = productId ? `/?product=${encodeURIComponent(productId)}` : (notificationData.url || '/');

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there is already an open window and focus it
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          if (productId) {
            client.postMessage({
              type: 'TIKBLOX_OPEN_PRODUCT',
              productId: productId,
            });
          }
          return;
        }
      }
      // If no window is currently open, launch a new one
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

self.addEventListener('notificationclose', (event) => {
  console.log('[TIKBLOX SW] Notificação dispensada pelo usuário:', event.notification.tag);
});
