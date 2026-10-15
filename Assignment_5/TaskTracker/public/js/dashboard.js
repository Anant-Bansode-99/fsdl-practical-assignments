document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('taskflow_token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    function getAuthHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }
    const addTaskForm = document.getElementById('addTaskForm');
    const tasksContainer = document.getElementById('tasksContainer');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const dashboardDate = document.getElementById('dashboardDate');

    let currentFilter = 'all';
    let tasks = [];
    let localTimers = {}; // To manage setIntervals

    // Logout Handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('taskflow_token');
            localStorage.removeItem('taskflow_user');
            localStorage.removeItem('taskflow_name');
            window.location.href = '/login.html';
        });
    }

    // Dynamic Greeting
    const greetingEl = document.querySelector('.top-bar h1');
    if (greetingEl) {
        const hour = new Date().getHours();
        let greeting = 'Good Evening! 🌙';
        if (hour < 5) greeting = 'Good Night! 😴';
        else if (hour >= 5 && hour < 12) greeting = 'Good Morning! ☀️';
        else if (hour >= 12 && hour < 17) greeting = 'Good Afternoon! ☕';
        greetingEl.innerHTML = greeting;
    }

    // Init
    fetchTasks();

    // Populate user profile in header
    const userName = localStorage.getItem('taskflow_name') || '';
    const userEmail = localStorage.getItem('taskflow_user') || '';
    const nameEl = document.getElementById('userNameDisplay');
    const emailEl = document.getElementById('userEmailDisplay');
    const avatarEl = document.getElementById('userAvatar');
    if (nameEl) nameEl.textContent = userName;
    if (emailEl) emailEl.textContent = userEmail;
    if (avatarEl && userName) avatarEl.textContent = userName.charAt(0).toUpperCase();

    // Filtering
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            renderTasks();
        });
    });

    // Fetch Tasks from API
    async function fetchTasks() {
        try {
            const res = await fetch('http://localhost:3000/api/tasks', { headers: getAuthHeaders() });
            if (res.status === 401) {
                localStorage.removeItem('taskflow_token');
                window.location.href = '/login.html';
                return;
            }
            tasks = await res.json();
            renderTasks();
        } catch (error) {
            console.error('Error fetching tasks:', error);
            tasksContainer.innerHTML = '<div class="loading-state">Failed to load tasks.</div>';
        }
    }

    // Render Tasks
    function renderTasks() {
        tasksContainer.innerHTML = '';

        const pendingCount = tasks.filter(t => t.status === 'pending').length;
        const completedCount = tasks.filter(t => t.status === 'completed').length;

        // Update Pending Badge
        const pendingBadge = document.getElementById('pendingCountBadge');
        if (pendingBadge) {
            pendingBadge.innerText = `${pendingCount} Pending`;
            pendingBadge.style.display = pendingCount > 0 ? 'inline-block' : 'none';
        }

        // Show/Hide Clear Completed button
        const clearCompletedBtn = document.getElementById('clearCompletedBtn');
        if (clearCompletedBtn) {
            clearCompletedBtn.style.display = completedCount > 0 ? 'flex' : 'none';
        }

        const filteredTasks = tasks.filter(t => {
            if (currentFilter === 'all') return true;
            return t.status === currentFilter;
        });

        if (filteredTasks.length === 0) {
            tasksContainer.innerHTML = '<div class="loading-state">No tasks found.</div>';
            return;
        }

        // Group tasks by targetDate
        const groupedTasks = {};
        filteredTasks.forEach(task => {
            const dateStr = task.targetDate || 'No Date';
            if (!groupedTasks[dateStr]) groupedTasks[dateStr] = [];
            groupedTasks[dateStr].push(task);
        });

        // Sort dates: newest first (descending), No Date at bottom
        const sortedDates = Object.keys(groupedTasks).sort((a, b) => {
            if (a === 'No Date') return 1;
            if (b === 'No Date') return -1;
            return b.localeCompare(a); // yyyy-mm-dd sorts alphabetically descending = newest first
        });

        sortedDates.forEach(dateStr => {
            // Create Date Header
            const header = document.createElement('div');
            header.className = 'date-group-header';

            // Format Header Text — just the date, no "Today" prefix
            if (dateStr === 'No Date') {
                header.innerHTML = '<h3>No Date Assigned</h3>';
            } else {
                const [y, m, d] = dateStr.split('-');
                const formattedDate = new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
                header.innerHTML = `<h3>${formattedDate}</h3>`;
            }
            tasksContainer.appendChild(header);

            // Group Container
            const groupContainer = document.createElement('div');
            groupContainer.style.marginBottom = '20px';

            groupedTasks[dateStr].forEach(task => {
                const taskCard = document.createElement('div');
                taskCard.className = `task-card ${task.status}`;

                // Format time display
                let totalSeconds = task.timeSpent;
                if (task.timerActive && task.timerStartedAt) {
                    const start = new Date(task.timerStartedAt);
                    const now = new Date();
                    totalSeconds += Math.floor((now - start) / 1000);
                }
                const timeStr = formatTime(totalSeconds);

                const createdDate = new Date(task.createdAt);
                const createdAtStr = createdDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                const timeStrMeta = createdDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

                taskCard.innerHTML = `
                    <div class="task-checkbox" onclick="toggleTaskStatus('${task._id}', '${task.status}')">
                        ${task.status === 'completed' ? `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>` : ""}
                    </div>
                    <div class="task-content">
                        <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 6px;">
                            <h3 class="task-title" style="margin-bottom: 0;">${task.title}</h3>
                            ${task.priority === 'High' ? `<span class="priority-badge high">High</span>` : ''}
                            ${task.priority === 'Medium' ? `<span class="priority-badge medium">Medium</span>` : ''}
                            ${task.priority === 'Low' ? `<span class="priority-badge low">Low</span>` : ''}
                        </div>
                        <p class="task-desc">${task.description || 'No description provided.'}</p>
                        <div class="task-meta">
                            <span class="badge ${task.status}">${task.status.toUpperCase()}</span>
                            <span class="meta-date" title="Task Created At"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> Created: ${createdAtStr} at ${timeStrMeta}</span>
                        </div>
                    </div>
                    <div class="timer-container">
                        <div class="time-display ${task.timerActive ? 'active' : ''}" id="timer-${task._id}">${timeStr}</div>
                        ${task.status === 'pending' ? `
                            ${task.timerActive ? `
                                <button class="timer-btn stop" onclick="stopTimer('${task._id}')" title="Stop Timer">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>
                                </button>
                            ` : `
                                <button class="timer-btn play" onclick="startTimer('${task._id}')" title="Start Timer">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                </button>
                            `}
                        ` : ''}
                    </div>
                    <div class="actions">
                         <button class="timer-btn" onclick="deleteTask('${task._id}')" title="Delete Task" style="color: var(--danger)">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                    </div>
                `;
                groupContainer.appendChild(taskCard);

                // Start local interval if timer is active
                if (task.timerActive && task.status === 'pending') {
                    if (localTimers[task._id]) clearInterval(localTimers[task._id]);
                    localTimers[task._id] = setInterval(() => {
                        const el = document.getElementById(`timer-${task._id}`);
                        if (el) {
                            const start = new Date(task.timerStartedAt);
                            const now = new Date();
                            const tt = task.timeSpent + Math.floor((now - start) / 1000);
                            el.innerText = formatTime(tt);
                        } else {
                            clearInterval(localTimers[task._id]);
                        }
                    }, 1000);
                }
            });

            tasksContainer.appendChild(groupContainer);
        });
    }

    // Helper to format SS to HH:MM:SS
    function formatTime(totalSeconds) {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    // Global Functions (attached to window for onclick handlers)
    window.toggleTaskStatus = async (id, currentStatus) => {
        if (currentStatus === 'completed') {
            alert('Completed tasks cannot be reverted to pending.');
            return;
        }

        const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';

        const task = tasks.find(t => t._id === id);
        if (newStatus === 'completed' && task.timerActive) {
            await fetch(`http://localhost:3000/api/tasks/${id}/stop-timer`, { method: 'POST', headers: getAuthHeaders() });
        }

        try {
            await fetch(`http://localhost:3000/api/tasks/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ status: newStatus, timerActive: false })
            });
            fetchTasks();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    window.startTimer = async (id) => {
        try {
            await fetch(`http://localhost:3000/api/tasks/${id}/start-timer`, { method: 'POST', headers: getAuthHeaders() });
            fetchTasks();
        } catch (error) {
            console.error('Error starting timer:', error);
        }
    };

    window.stopTimer = async (id) => {
        try {
            await fetch(`http://localhost:3000/api/tasks/${id}/stop-timer`, { method: 'POST', headers: getAuthHeaders() });
            if (localTimers[id]) {
                clearInterval(localTimers[id]);
            }
            fetchTasks();
        } catch (error) {
            console.error('Error stopping timer:', error);
        }
    };

    window.deleteTask = async (id) => {
        if (!confirm('Are you sure you want to delete this task?')) return;
        try {
            await fetch(`http://localhost:3000/api/tasks/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
            fetchTasks();
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const clearCompletedBtn = document.getElementById('clearCompletedBtn');
    if (clearCompletedBtn) {
        clearCompletedBtn.addEventListener('click', async () => {
            if (!confirm('Are you sure you want to delete all completed tasks? This cannot be undone.')) return;
            try {
                await fetch('http://localhost:3000/api/tasks/clear-completed', { method: 'DELETE', headers: getAuthHeaders() });
                fetchTasks();
            } catch (error) {
                console.error('Error clearing completed tasks:', error);
            }
        });
    }
});
