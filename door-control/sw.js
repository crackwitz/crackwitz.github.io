self.addEventListener('install', event => {
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(clients.claim());
});

// A fetch handler is REQUIRED for Chrome to consider this a PWA.
// For now, we just pass through to the network.
self.addEventListener('fetch', event => {
    event.respondWith(fetch(event.request));
});

self.addEventListener('notificationclick', event => {
    const action = event.action;
    event.notification.close();

    if (action === 'open') {
        // Send a message to focus the window AND trigger the latch
        event.waitUntil(
            self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
                for (const client of clients) {
                    if (client.url === event.notification.data.url && 'focus' in client) {
                        client.focus();
                        client.postMessage('trigger-latch');
                        return;
                    }
                }
                // If no window found, open a new one (it will handle it via state/params if needed, 
                // but usually the bell notification implies we are already active)
                if (self.clients.openWindow) {
                    return self.clients.openWindow(event.notification.data.url);
                }
            })
        );
    } else {
        // Just focus the window
        event.waitUntil(
            self.clients.matchAll({ type: 'window' }).then(clients => {
                for (const client of clients) {
                    if (client.url === event.notification.data.url && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (self.clients.openWindow) {
                    return self.clients.openWindow(event.notification.data.url);
                }
            })
        );
    }
});
