const appDiv = document.getElementById('app-content');
const homeBtn = document.getElementById('home-btn');
const aboutBtn = document.getElementById('about-btn');

const VAPID_KEY = 'BNuSv9zzyzPb75XC5wWSEyHfaSrEIlXSw_7urlScyrAFcXvyy1y0H3ixT3Hsg0Pv_tXDV_0uvAN1o1lB62XkHxs';

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

function formatDateTime(d) {
    const date = new Date(d);
    return date.getDate().toString().padStart(2,'0') + '.' + (date.getMonth()+1).toString().padStart(2,'0') + '.' + date.getFullYear() + ', ' + date.getHours().toString().padStart(2,'0') + ':' + date.getMinutes().toString().padStart(2,'0');
}

function loadNotes() {
    const notes = JSON.parse(localStorage.getItem('notes') || '[]');
    const container = document.getElementById('notes-list');
    if (!container) return;
    
    if (notes.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:#888;">Нет заметок</p>';
        return;
    }
    
    container.innerHTML = '';
    for (let i = 0; i < notes.length; i++) {
        const note = notes[i];
        const div = document.createElement('div');
        div.className = 'note';
        let reminderHtml = '';
        if (note.reminder) {
            reminderHtml = '<div class="note-reminder">Напоминание: ' + formatDateTime(note.reminder) + '</div>';
        }
        div.innerHTML = '<div class="note-text">' + note.text + '</div>' + reminderHtml + '<button class="delete" data-index="' + i + '">Удалить</button>';
        container.appendChild(div);
    }
    
    document.querySelectorAll('.delete').forEach(btn => {
        btn.onclick = () => {
            const notesNew = JSON.parse(localStorage.getItem('notes') || '[]');
            notesNew.splice(btn.dataset.index, 1);
            localStorage.setItem('notes', JSON.stringify(notesNew));
            loadNotes();
        };
    });
}

function showHome() {
    appDiv.innerHTML = `
        <h2>Добавить заметку</h2>
        <form id="note-form">
            <input type="text" id="note-text" placeholder="Введите текст заметки" required>
            <input type="datetime-local" id="note-reminder" required>
            <button type="submit">Добавить с напоминанием</button>
        </form>
        <h2>Список заметок</h2>
        <div id="notes-list"></div>
    `;
    
    loadNotes();
    
    const form = document.getElementById('note-form');
    const textInput = document.getElementById('note-text');
    const reminderInput = document.getElementById('note-reminder');
    
    form.onsubmit = async (e) => {
        e.preventDefault();
        const text = textInput.value.trim();
        const reminder = reminderInput.value;
        
        if (!text) { alert('Введите текст'); return; }
        if (!reminder) { alert('Выберите время'); return; }
        
        const notes = JSON.parse(localStorage.getItem('notes') || '[]');
        const id = Date.now();
        notes.push({ id, text, reminder });
        localStorage.setItem('notes', JSON.stringify(notes));
        
        await fetch('/schedule', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, text, reminderTime: reminder })
        });
        
        textInput.value = '';
        reminderInput.value = '';
        loadNotes();
        alert('Напоминание на ' + new Date(reminder).toLocaleString());
    };
}

function showAbout() {
    appDiv.innerHTML = `
        <div style="text-align: center; padding: 40px 20px;">
            <h2>О приложении</h2>
            <p>Версия 1.0.0</p>
            <p>Приложение для списка дел с push-уведомлениями</p>
            <p>Можно отложить на 5 минут</p>
        </div>
    `;
}

homeBtn.onclick = () => {
    homeBtn.classList.add('active');
    aboutBtn.classList.remove('active');
    showHome();
};

aboutBtn.onclick = () => {
    aboutBtn.classList.add('active');
    homeBtn.classList.remove('active');
    showAbout();
};

showHome();

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(reg => {
        console.log('SW registered');
        
        const enableBtn = document.getElementById('enable-push');
        const disableBtn = document.getElementById('disable-push');
        
        enableBtn.onclick = async () => {
            const perm = await Notification.requestPermission();
            if (perm !== 'granted') {
                alert('Нужно разрешить уведомления');
                return;
            }
            
            const sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_KEY)
            });
            
            await fetch('/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sub)
            });
            
            enableBtn.style.display = 'none';
            disableBtn.style.display = 'block';
            alert('Уведомления включены');
        };
        
        disableBtn.onclick = async () => {
            const sub = await reg.pushManager.getSubscription();
            if (sub) await sub.unsubscribe();
            enableBtn.style.display = 'block';
            disableBtn.style.display = 'none';
            alert('Уведомления отключены');
        };
        
        reg.pushManager.getSubscription().then(sub => {
            if (sub) {
                enableBtn.style.display = 'none';
                disableBtn.style.display = 'block';
            }
        });
    });
}