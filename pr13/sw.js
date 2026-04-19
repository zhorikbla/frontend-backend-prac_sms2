self.addEventListener('push', (event) => {
    let data = { title: 'Уведомление', body: '', reminderId: null };
    if (event.data) {
        try {
            data = event.data.json();
        } catch(e) {
            data.body = event.data.text();
        }
    }
    
    const options = {
        body: data.body,
        icon: '/icon.png',
        requireInteraction: true,
        data: { reminderId: data.reminderId }
    };
    
    if (data.reminderId) {
        options.actions = [
            { action: 'snooze', title: 'Отложить на 5 минут' }
        ];
    }
    
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', (event) => {
    const notification = event.notification;
    const action = event.action;
    const reminderId = notification.data.reminderId;
    
    notification.close();
    
    if (action === 'snooze' && reminderId) {
        event.waitUntil(
            fetch('/snooze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reminderId: reminderId })
            })
        );
    } else {
        event.waitUntil(clients.openWindow('/'));
    }
});