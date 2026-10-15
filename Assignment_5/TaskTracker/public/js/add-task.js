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
    const taskDateInput = document.getElementById('taskDate');
    const successMsg = document.getElementById('successMsg');

    // Populate user profile in header
    const userName = localStorage.getItem('taskflow_name') || '';
    const userEmail = localStorage.getItem('taskflow_user') || '';
    const nameEl = document.getElementById('userNameDisplay');
    const emailEl = document.getElementById('userEmailDisplay');
    const avatarEl = document.getElementById('userAvatar');
    if (nameEl) nameEl.textContent = userName;
    if (emailEl) emailEl.textContent = userEmail;
    if (avatarEl && userName) avatarEl.textContent = userName.charAt(0).toUpperCase();

    // Default to today (Local Timezone adjusted)
    const now = new Date();
    // Offset standardizes the date to the user's local timezone instead of UTC shift
    const today = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    taskDateInput.value = today;

    addTaskForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = document.getElementById('taskTitle').value;
        const date = document.getElementById('taskDate').value;
        const desc = document.getElementById('taskDesc').value;
        const priority = document.getElementById('taskPriority').value;

        try {
            const res = await fetch('http://localhost:3000/api/tasks', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ title, targetDate: date, description: desc, priority })
            });
            if (res.ok) {
                // Show success message
                successMsg.style.display = 'block';
                setTimeout(() => successMsg.style.display = 'none', 3000);

                // Reset form but keep the active date and default priority
                addTaskForm.reset();
                document.getElementById('taskDate').value = date;
                document.getElementById('taskPriority').value = 'Medium';

                // Refresh stats (removed)
            } else {
                const data = await res.json();
                alert(data.error || 'Error creating task');
            }
        } catch (error) {
            console.error('Error adding task:', error);
            alert('Failed to add task. Please try again.');
        }
    });
});
