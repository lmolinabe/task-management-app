const express = require('express');
const router = express.Router();
const taskController = require('../controllers/TaskController');
const authMiddleware = require('../middleware/AuthMiddleware');
const { check } = require('express-validator');

// Protect all routes with authentication middleware
router.use(authMiddleware);

// Define route to get all tasks for the authenticated user
router.get('/', taskController.getAllTasks);

// Define route to create a new task
router.post('/', [
    check('title', 'Title is required').notEmpty(),
    check('dueDate', 'Due date is required').isDate(),
    check('status').optional().isIn(['pending', 'in-progress', 'completed']), // Optional, but check if provided
], taskController.createTask);

// Define route to get a specific task by its ID
router.get('/:id', taskController.getTaskById);

// Define route to update a specific task by its ID
router.put('/:id', [
    check('title', 'Title is required').optional().notEmpty(), // Optional for updates
    check('dueDate', 'Due date is required').optional().isDate(), // Optional for updates
    check('status').optional().isIn(['pending', 'in-progress', 'completed']), // Optional for updates
], taskController.updateTask);

// Define route to delete a specific task by its ID
router.delete('/:id', taskController.deleteTask);

// Export the router
module.exports = router;
