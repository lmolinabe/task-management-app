// Import the Task model
const Task = require('../models/Task');
const { validationResult } = require('express-validator');

// Create a new task
exports.createTask = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

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
        res.status(500).json({ error: 'Failed to create task.' });
    }
};

// Get all tasks for the authenticated user
exports.getAllTasks = async (req, res) => {
    try {
        // 1. Filtering by Status
        const { status, page = 1, limit = 10 } = req.query;
        const query = { user: req.userId };

        if (status) {
            query.status = status;
        }

        // 2. Sorting by Due Date
        const sortOptions = {}; 
        if (req.query.sortBy && req.query.sortOrder) {
            sortOptions[req.query.sortBy] = req.query.sortOrder === 'desc' ? -1 : 1; 
        } else {
            sortOptions.dueDate = 1; // Default sort by dueDate ascending
        }

        // 3. Pagination
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const totalTasks = await Task.countDocuments(query);

        const tasks = await Task.find(query)
            .sort(sortOptions)
            .skip(startIndex)
            .limit(parseInt(limit)); 

        // Pagination results
        const pagination = {};
        if (endIndex < totalTasks) {
            pagination.next = {
                page: parseInt(page) + 1,
                limit: parseInt(limit),
            };
        }

        if (startIndex > 0) {
            pagination.prev = {
                page: parseInt(page) - 1,
                limit: parseInt(limit),
            };
        }

        res.status(200).json({ 
            totalTasks,
            totalPages: Math.ceil(totalTasks / limit),
            currentPage: parseInt(page),
            pagination,
            data: tasks 
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve tasks.' });
    }
};

// Get a specific task by ID
exports.getTaskById = async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, user: req.userId });

        if (!task) {
            return res.status(404).json({ error: 'Task not found.' });
        }

        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve task.' });
    }
};

// Update a specific task by ID
exports.updateTask = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, description, dueDate, status } = req.body;

        const updatedTask = await Task.findOneAndUpdate(
            { _id: req.params.id, user: req.userId },
            { title, description, dueDate, status },
            { new: true, runValidators: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ error: 'Task not found.' });
        }

        res.status(200).json(updatedTask);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update task.' });
    }
};

// Delete a specific task by ID
exports.deleteTask = async (req, res) => {
    try {
        const deletedTask = await Task.findOneAndDelete({ _id: req.params.id, user: req.userId });

        if (!deletedTask) {
            return res.status(404).json({ error: 'Task not found.' });
        }

        res.status(200).json({ msg: 'Task deleted successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete task.' });
    }
};
