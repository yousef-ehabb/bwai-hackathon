/**
 * UrbanFix Service Worker
 * 
 * Handles browser push notifications and background sync.
 * Works alongside the main app notification system.
 */

const CACHE_NAME = 'urbanfix-v1';
const STATIC_ASSETS = [
  '/',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
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

// Message event from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, ...options } = event.data.payload;
    
    self.registration.showNotification(title, {
      ...options,
      icon: options.icon || '/icon-192x192.png',
      badge: options.badge || '/badge-72x72.png',
      vibrate: options.requireInteraction ? [200, 100, 200] : undefined,
    });
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const { actionUrl, reportId } = event.notification.data || {};
  
  // Determine the URL to open
  let url = actionUrl || '/';
  
  // Handle notification actions if expanded
  if (event.action === 'view') {
    url = actionUrl || '/';
  } else if (event.action === 'dismiss') {
    return;
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if available
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Open new window if no matching client
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Push event from push server (future Supabase integration)
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    
    const options = {
      body: data.message || 'New notification from UrbanFix',
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      tag: data.reportId || data.type || 'general',
      requireInteraction: data.priority === 'critical',
      data: {
        actionUrl: data.actionUrl,
        reportId: data.reportId,
      },
      actions: data.actions || [
        { action: 'view', title: 'View' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    };
    
    event.waitUntil(
      self.registration.showNotification(
        data.title || 'UrbanFix',
        options
      )
    );
  } catch (error) {
    // Fallback for non-JSON push data
    event.waitUntil(
      self.registration.showNotification('UrbanFix', {
        body: event.data.text(),
        icon: '/icon-192x192.png',
      })
    );
  }
});

// Background sync for offline support (future)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-reports') {
    // Future: sync pending reports when back online
    event.waitUntil(syncPendingReports());
  }
});

async function syncPendingReports() {
  // Placeholder for future offline sync
  // Will integrate with Supabase when backend is added
  console.log('Background sync triggered for reports');
}
