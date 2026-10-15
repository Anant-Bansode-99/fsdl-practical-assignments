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

    // Populate user profile in header
    const userName = localStorage.getItem('taskflow_name') || '';
    const userEmail = localStorage.getItem('taskflow_user') || '';
    const nameEl = document.getElementById('userNameDisplay');
    const emailEl = document.getElementById('userEmailDisplay');
    const avatarEl = document.getElementById('userAvatar');
    if (nameEl) nameEl.textContent = userName;
    if (emailEl) emailEl.textContent = userEmail;
    if (avatarEl && userName) avatarEl.textContent = userName.charAt(0).toUpperCase();

    let statusChart, timeChart, durationChart;

    async function fetchTasks() {
        try {
            const res = await fetch('http://localhost:3000/api/tasks', { headers: getAuthHeaders() });
            if (res.status === 401) {
                localStorage.removeItem('taskflow_token');
                window.location.href = '/login.html';
                return;
            }
            const tasks = await res.json();
            calculateStats(tasks);
            renderCharts(tasks);
        } catch (err) {
            console.error('Error fetching analytics data:', err);
        }
    }

    function calculateStats(tasks) {
        const total = tasks.length;
        const completed = tasks.filter(t => t.status === 'completed').length;

        let totalTimeSecs = 0;
        tasks.forEach(t => totalTimeSecs += t.timeSpent);
        const totalHours = Math.floor(totalTimeSecs / 3600);
        const totalMins = Math.floor((totalTimeSecs % 3600) / 60);

        // Get Today's Date normalized
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        const date = today.getDate();

        // 1. Tasks Scheduled for Today
        const scheduledToday = tasks.filter(t => {
            const tDate = new Date(t.targetDate || t.createdAt);
            return tDate.getFullYear() === year &&
                tDate.getMonth() === month &&
                tDate.getDate() === date;
        }).length;

        // 2. Completed Today
        const completedToday = tasks.filter(t => {
            if (t.status !== 'completed') return false;
            // Use completedAt if we have it, else fallback to targetDate logic (though imperfect, this fits with earlier implementation)
            const cDate = new Date(t.completedAt || t.targetDate || t.createdAt);
            return cDate.getFullYear() === year &&
                cDate.getMonth() === month &&
                cDate.getDate() === date;
        }).length;

        const rate = total === 0 ? 0 : Math.round((completed / total) * 100);

        document.getElementById('totalTasks').innerText = total;
        document.getElementById('completedTasks').innerText = completed;
        document.getElementById('todayScheduled').innerText = scheduledToday;
        document.getElementById('todayCompleted').innerText = completedToday;
        document.getElementById('completionRate').innerText = `${rate}%`;
        document.getElementById('totalTime').innerText = `${totalHours}h ${totalMins}m`;
    }

    function renderCharts(tasks) {
        // Prepare data for Daily Stacked Bar Chart
        const dailyStats = {};

        tasks.forEach(t => {
            const dateObj = new Date(t.targetDate || t.createdAt);
            const dateStr = dateObj.toLocaleDateString();

            if (!dailyStats[dateStr]) {
                dailyStats[dateStr] = { completed: 0, pending: 0 };
            }
            if (t.status === 'completed') {
                dailyStats[dateStr].completed++;
            } else {
                dailyStats[dateStr].pending++;
            }
        });

        const dates = Object.keys(dailyStats).sort((a, b) => new Date(a) - new Date(b));
        const dailyCompleted = dates.map(d => dailyStats[d].completed);
        const dailyPending = dates.map(d => dailyStats[d].pending);

        // Prepare data for 'Today' Doughnut Chart
        const todayObj = new Date();
        const todayStr = todayObj.toLocaleDateString();
        const todayData = dailyStats[todayStr] || { completed: 0, pending: 0 };
        const todaysTotal = todayData.completed + todayData.pending;

        Chart.defaults.color = '#6b7280'; // Updated to light theme muted text
        Chart.defaults.font.family = "'Inter', sans-serif";

        const ctxStatus = document.getElementById('statusChart').getContext('2d');
        if (statusChart) statusChart.destroy();
        statusChart = new Chart(ctxStatus, {
            type: 'bar',
            data: {
                labels: dates.length > 0 ? dates : ['No Data'],
                datasets: [
                    {
                        label: 'Completed',
                        data: dates.length > 0 ? dailyCompleted : [0],
                        backgroundColor: '#10b981',
                        borderRadius: 4
                    },
                    {
                        label: 'Pending',
                        data: dates.length > 0 ? dailyPending : [0],
                        backgroundColor: '#f59e0b',
                        borderRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { stacked: true },
                    y: { stacked: true, beginAtZero: true, ticks: { stepSize: 1 } }
                }
            }
        });

        const ctxTime = document.getElementById('timeChart').getContext('2d');
        if (timeChart) timeChart.destroy();
        timeChart = new Chart(ctxTime, {
            type: 'doughnut',
            data: {
                labels: todaysTotal > 0 ? ['Completed', 'Pending'] : ['No Tasks Assigned'],
                datasets: [{
                    data: todaysTotal > 0 ? [todayData.completed, todayData.pending] : [1],
                    backgroundColor: todaysTotal > 0 ? ['#10b981', '#f59e0b'] : ['#e5e7eb'], // Updated empty state color
                    borderWidth: 0,
                    hoverOffset: todaysTotal > 0 ? 4 : 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });

        // Setup filter for duration chart
        const filterSelect = document.getElementById('durationDateFilter');
        filterSelect.innerHTML = '<option value="all">All Time</option>';
        dates.forEach(d => {
            const opt = document.createElement('option');
            opt.value = d;
            opt.innerText = d;
            filterSelect.appendChild(opt);
        });

        // Default to the most recent day containing tasks
        let currentFilter = dates.length > 0 ? dates[dates.length - 1] : 'all';
        filterSelect.value = currentFilter;

        const renderDurationChart = (filterDate) => {
            let filteredTasks = tasks.filter(t => t.status === 'completed');
            if (filterDate !== 'all') {
                filteredTasks = filteredTasks.filter(t => {
                    const tDateStr = new Date(t.completedAt || t.targetDate || t.createdAt).toLocaleDateString();
                    return tDateStr === filterDate;
                });
            }

            const completedTasks = filteredTasks.map(t => t.title.length > 15 ? t.title.substring(0, 15) + '...' : t.title);
            const taskDurations = filteredTasks.map(t => Math.round(t.timeSpent / 60)); // in minutes

            const ctxDuration = document.getElementById('durationChart').getContext('2d');
            if (durationChart) durationChart.destroy();
            durationChart = new Chart(ctxDuration, {
                type: 'bar',
                data: {
                    labels: completedTasks.length > 0 ? completedTasks : ['No Data'],
                    datasets: [{
                        label: 'Time Taken (minutes)',
                        data: taskDurations.length > 0 ? taskDurations : [0],
                        backgroundColor: '#4f46e5', // Updated bar color to match primary theme
                        borderRadius: 4
                    }]
                },
                options: {
                    indexAxis: 'y', // Makes the bar chart horizontal
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        x: { beginAtZero: true },
                        y: { grid: { display: false } }
                    }
                }
            });
        };

        // Render initial duration chart
        renderDurationChart(currentFilter);

        // Add event listener to re-render when filter changes
        filterSelect.addEventListener('change', (e) => {
            renderDurationChart(e.target.value);
        });
    }

    fetchTasks();
});
