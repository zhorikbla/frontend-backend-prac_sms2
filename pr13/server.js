const express = require('express');
const https = require('https');
const fs = require('fs');
const webpush = require('web-push');
const path = require('path');

const vapidKeys = {
    publicKey: 'BNuSv9zzyzPb75XC5wWSEyHfaSrEIlXSw_7urlScyrAFcXvyy1y0H3ixT3Hsg0Pv_tXDV_0uvAN1o1lB62XkHxs',
    privateKey: 'kP9Fvrdepch2Vo4aQr-YvYq5s7n5okcItJH_PD99Sgk'
};

webpush.setVapidDetails('mailto:test@test.com', vapidKeys.publicKey, vapidKeys.privateKey);

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

let subscriptions = [];
let reminders = {};

app.post('/subscribe', (req, res) => {
    subscriptions.push(req.body);
    console.log('Подписок:', subscriptions.length);
    res.json({ok: true});
});

app.post('/schedule', (req, res) => {
    const { id, text, reminderTime } = req.body;
    const target = new Date(reminderTime).getTime();
    const now = Date.now();
    const delay = target - now;
    
    if (delay <= 0) {
        return res.status(400).json({error: 'Время должно быть в будущем'});
    }
    
    const timer = setTimeout(() => {
        const payload = JSON.stringify({ title: 'Напоминание', body: text, reminderId: id });
        subscriptions.forEach(s => {
            webpush.sendNotification(s, payload).catch(e => console.log('Push error:', e.message));
        });
        delete reminders[id];
    }, delay);
    
    reminders[id] = { timer, text, reminderTime };
    console.log(`Запланировано: ${text} через ${Math.round(delay/1000)} сек`);
    res.json({ok: true});
});

app.post('/snooze', (req, res) => {
    const { reminderId } = req.body;
    const r = reminders[reminderId];
    if (!r) {
        return res.status(400).json({error: 'Не найдено'});
    }
    
    clearTimeout(r.timer);
    
    const newTimer = setTimeout(() => {
        const payload = JSON.stringify({ title: 'Напоминание (отложено)', body: r.text, reminderId: reminderId });
        subscriptions.forEach(s => {
            webpush.sendNotification(s, payload).catch(e => console.log('Push error:', e.message));
        });
        delete reminders[reminderId];
    }, 5 * 60 * 1000);
    
    reminders[reminderId] = { timer: newTimer, text: r.text, reminderTime: Date.now() + 5 * 60 * 1000 };
    console.log(`Отложено: ${r.text} на 5 минут`);
    res.json({ok: true});
});

const options = {
    key: fs.readFileSync('localhost-key.pem'),
    cert: fs.readFileSync('localhost.pem')
};

https.createServer(options, app).listen(3001, () => {
    console.log('Сервер: https://localhost:3001');
});