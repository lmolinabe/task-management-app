const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const authMiddleware = require('../middleware/AuthMiddleware');

// Protect all routes with authentication middleware
router.use(authMiddleware);

// User Profile Routes
router.get('/profile', UserController.getProfile);

// User Settings Route
router.put('/settings', UserController.updateSettings);

module.exports = router;