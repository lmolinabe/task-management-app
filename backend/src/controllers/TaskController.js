// Import the Task model
const Task = require('../models/Task');
const { validationResult } = require('express-validator');
const moment = require('moment');
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window; // Create a virtual DOM
const DOMPurify = createDOMPurify(window); // Initialize DOMPurify

// Create a new task
exports.createTask = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, description, dueDate, status } = req.body;

        // Sanitize the title and description using DOMPurify
        const sanitizedTitle = DOMPurify.sanitize(title);
        const sanitizedDescription = DOMPurify.sanitize(description);

        const newTask = new Task({
            title: sanitizedTitle,
            description: sanitizedDescription,
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

// Get tasks summary for the authenticated user
exports.getTasksSummary = async (req, res) => {
    try {
        const userId = req.userId;
        const currentDate = moment().utc();
        const dueSoonDate = moment().utc().add(24, 'hours'); // 24 hours from now
        const totalTasks = await Task.countDocuments({ user: userId });
        const onTimeTasks  = await Task.countDocuments({
            user: userId,
            dueDate: { $gt: dueSoonDate.clone() }
        });        
        const dueSoonTasks = await Task.countDocuments({
            user: userId,
            dueDate: { $gte: currentDate.clone(), $lte: dueSoonDate.clone() }
        });
        const completedTasks = await Task.countDocuments({ user: userId, status: 'completed' });
        const overdueTasks = await Task.countDocuments({
            user: userId,
            dueDate: { $lt: currentDate.clone() },
            status: { $ne: 'completed' }
        });

        res.json({
            totalTasks,
            onTimeTasks,            
            dueSoonTasks,
            completedTasks,
            overdueTasks
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Get all tasks for the authenticated user
exports.getAllTasks = async (req, res) => {
    try {
        // 1. Filtering by Status
        const { status } = req.query;
        const query = { user: req.userId };

        if (status && status !== 'all') {
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
        const page = parseInt(req.query.page) || 1; // Default to 1 if invalid
        const limit = parseInt(req.query.limit) || 5; // Default to 5 if invalid
    
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
            data: tasks.map(task => ({
                ...task.toObject(), // Convert Mongoose document to plain object
                dueDate: task.dueDate.toISOString() // Convert dueDate to UTC string
            })) 
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

        // Sanitize the title and description using DOMPurify
        const sanitizedTitle = DOMPurify.sanitize(title);
        const sanitizedDescription = DOMPurify.sanitize(description);        

        const updatedTask = await Task.findOneAndUpdate(
            { _id: req.params.id, user: req.userId },
            { title: sanitizedTitle, description: sanitizedDescription, dueDate, status },
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
