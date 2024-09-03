// Import the Task model
const Task = require('../models/Task');

// Create a new task
exports.createTask = async (req, res) => {
    try {
        const { title, description, dueDate, status } = req.body;

        const newTask = new Task({
            title,
            description,
            dueDate,
            status,
            user: req.userId
        });

        const savedTask = await newTask.save();
        res.status(201).json(savedTask);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create task' });
    }
};

// Get all tasks for the authenticated user
exports.getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.userId }).sort({ dueDate: 1 });
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve tasks' });
    }
};

// Get a specific task by ID
exports.getTaskById = async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, user: req.userId });

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve task' });
    }
};

// Update a specific task by ID
exports.updateTask = async (req, res) => {
    try {
        const { title, description, dueDate, status } = req.body;

        const updatedTask = await Task.findOneAndUpdate(
            { _id: req.params.id, user: req.userId },
            { title, description, dueDate, status },
            { new: true, runValidators: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.status(200).json(updatedTask);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update task' });
    }
};

// Delete a specific task by ID
exports.deleteTask = async (req, res) => {
    try {
        const deletedTask = await Task.findOneAndDelete({ _id: req.params.id, user: req.userId });

        if (!deletedTask) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.status(200).json({ msg: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete task' });
    }
};
