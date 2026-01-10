// عناصر DOM
const taskInput = document.getElementById('taskInput');
const prioritySelect = document.getElementById('prioritySelect');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const emptyMessage = document.getElementById('emptyMessage');
const filterBtns = document.querySelectorAll('.filter-btn');
const statCards = document.querySelectorAll('.stat-card');

// المتغيرات
let tasks = [];
let currentFilter = 'all';
let editingTaskId = null;

// إصلاح التاريخ بالعربية
function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
    };
    return new Date(dateString).toLocaleDateString('ar-EG', options);
}

// حفظ المهام في التخزين المحلي
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    updateStats();
}

// تحميل المهام من التخزين المحلي
function loadTasks() {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    }
    renderTasks();
    updateStats();
}

// إضافة مهمة جديدة
function addTask() {
    const taskText = taskInput.value.trim();
    
    if (taskText === '') {
        showNotification('الرجاء إدخال نص المهمة', 'error');
        return;
    }
    
    if (taskText.length > 50) {
        showNotification('المهمة طويلة جداً (الحد الأقصى 50 حرف)', 'error');
        return;
    }

    const task = {
        id: Date.now(),
        text: taskText,
        priority: prioritySelect.value,
        completed: false,
        createdAt: new Date().toISOString()
    };

    tasks.unshift(task);
    saveTasks();
    renderTasks();
    
    taskInput.value = '';
    prioritySelect.value = 'normal';
    taskInput.focus();
    
    showNotification('تمت إضافة المهمة بنجاح', 'success');
}

// تبديل حالة المهمة
function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
        
        if (task.completed) {
            showNotification('تم إنجاز المهمة! 🎉', 'success');
        }
    }
}

// حذف مهمة
function deleteTask(id) {
    if (confirm('هل أنت متأكد من حذف هذه المهمة؟')) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks();
        showNotification('تم حذف المهمة', 'info');
    }
}

// تعديل مهمة
function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        const newText = prompt('تعديل المهمة:', task.text);
        if (newText !== null && newText.trim() !== '') {
            task.text = newText.trim();
            saveTasks();
            renderTasks();
            showNotification('تم تعديل المهمة', 'success');
        }
    }
}

// عرض المهام
function renderTasks() {
    const filteredTasks = tasks.filter(task => {
        if (currentFilter === 'pending') return !task.completed;
        if (currentFilter === 'completed') return task.completed;
        return true;
    });

    if (filteredTasks.length === 0) {
        taskList.innerHTML = '';
        emptyMessage.style.display = 'block';
        return;
    }

    emptyMessage.style.display = 'none';
    
    taskList.innerHTML = filteredTasks.map(task => `
        <li class="task-item ${task.completed ? 'completed' : ''} priority-${task.priority}" data-id="${task.id}">
            <div class="task-checkbox ${task.completed ? 'checked' : ''}" onclick="toggleTask(${task.id})"></div>
            <span class="task-text">${escapeHtml(task.text)}</span>
            <div class="task-actions">
                <button class="task-btn edit-btn" onclick="editTask(${task.id})" title="تعديل">✏️</button>
                <button class="task-btn delete-btn" onclick="deleteTask(${task.id})" title="حذف">🗑️</button>
            </div>
        </li>
    `).join('');
}

// تحديث الإحصائيات
function updateStats() {
    document.getElementById('totalTasks').textContent = tasks.length;
    document.getElementById('completedTasks').textContent = tasks.filter(t => t.completed).length;
    document.getElementById('pendingTasks').textContent = tasks.filter(t => !t.completed).length;
}

// تصفية المهام
function filterTasks(filter) {
    currentFilter = filter;
    
    filterBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    
    renderTasks();
}

// إظهار الإشعارات
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 15px 30px;
        border-radius: 10px;
        color: white;
        font-weight: bold;
        z-index: 1000;
        animation: slideDown 0.3s ease;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#667eea'};
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// حماية من XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// إضافة الأنيميشنات
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
    
    @keyframes fadeOut {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// أحداث
addTaskBtn.addEventListener('click', addTask);

taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterTasks(btn.dataset.filter);
    });
});

// بدء التطبيق
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    showNotification('مرحباً بك في قائمة المهام! 👋', 'info');
});
