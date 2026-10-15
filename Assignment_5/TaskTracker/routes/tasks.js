const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const authMiddleware = require('../middleware/auth');

// Apply auth to all task routes
router.use(authMiddleware);

// Get all tasks (scoped to logged-in user)
router.get('/', async (req, res) => {
    try {
        const { status, date } = req.query;
        const filter = { userId: req.userId };
        if (status) filter.status = status;
        if (date) filter.targetDate = date;

        const tasks = await Task.find(filter).sort({ createdAt: -1 });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a new task (owned by logged-in user)
router.post('/', async (req, res) => {
    try {
        const newTask = new Task({ ...req.body, userId: req.userId });
        const savedTask = await newTask.save();
        res.status(201).json(savedTask);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Clear completed tasks (scoped to logged-in user)
router.delete('/clear-completed', async (req, res) => {
    try {
        const result = await Task.deleteMany({ status: 'completed', userId: req.userId });
        res.json({ message: 'Completed tasks deleted successfully', deletedCount: result.deletedCount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a task
router.put('/:id', async (req, res) => {
    try {
        const taskId = req.params.id;
        const taskToUpdate = await Task.findOne({ _id: taskId, userId: req.userId });

        if (!taskToUpdate) {
            return res.status(404).json({ error: 'Task not found' });
        }

        if (taskToUpdate.status === 'completed' && req.body.status === 'pending') {
            return res.status(400).json({ error: 'Cannot revert a completed task to pending' });
        }

        if (taskToUpdate.status !== 'completed' && req.body.status === 'completed') {
            req.body.completedAt = new Date();
        }

        const updatedTask = await Task.findByIdAndUpdate(taskId, req.body, { new: true });
        res.json(updatedTask);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete a task
router.delete('/:id', async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        if (!task) return res.status(404).json({ error: 'Task not found' });
        res.json({ message: 'Task deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start timer
router.post('/:id/start-timer', async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, userId: req.userId });
        if (!task) return res.status(404).json({ error: 'Task not found' });

        if (!task.timerActive && task.status !== 'completed') {
            task.timerActive = true;
            task.timerStartedAt = new Date();
            await task.save();
        }
        res.json(task);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Stop timer
router.post('/:id/stop-timer', async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, userId: req.userId });
        if (!task) return res.status(404).json({ error: 'Task not found' });

        if (task.timerActive) {
            const now = new Date();
            const elapsed = Math.floor((now - task.timerStartedAt) / 1000);
            task.timeSpent += elapsed;
            task.timerActive = false;
            task.timerStartedAt = null;
            await task.save();
        }
        res.json(task);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
