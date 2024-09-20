const express = require('express');
const router = express.Router();
const taskController = require('../controllers/TaskController');
const authMiddleware = require('../middleware/AuthMiddleware');
const { check, body } = require('express-validator');

// Protect all routes with authentication middleware
router.use(authMiddleware);

// Define route to get tasks summary for the authenticated user
router.get('/summary', taskController.getTasksSummary);

// Define route to get all tasks for the authenticated user
router.get('/', taskController.getAllTasks);

// Custom validator for ISO 8601 date strings
const isISO8601Date = (value) => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
    return dateRegex.test(value);
};

// Define route to create a new task
router.post('/', [
    check('title', 'Title is required').notEmpty(),
    check('dueDate', 'Due date is required').custom(isISO8601Date), // Use custom validator
    check('status').optional().isIn(['pending', 'in-progress', 'completed']), // Optional, but check if provided
], taskController.createTask);

// Define route to get a specific task by its ID
router.get('/:id', taskController.getTaskById);

// Define route to update a specific task by its ID
router.put('/:id', [
    check('title', 'Title is required').optional().notEmpty(), // Optional for updates
    check('dueDate', 'Due date is required').custom(isISO8601Date), // Use custom validator
    check('status').optional().isIn(['pending', 'in-progress', 'completed']), // Optional for updates
], taskController.updateTask);

// Define route to delete a specific task by its ID
router.delete('/:id', taskController.deleteTask);

// Export the router
module.exports = router;
