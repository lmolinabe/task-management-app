const { check } = require('express-validator');
const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');
const authMiddleware = require('../middleware/AuthMiddleware');

// Sign up route
router.post(
    '/signup',
    [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password must be at least 8 characters long').isLength({ min: 8 }),
    ],
    authController.signup
);

// Log in route
router.post(
    '/login',
    [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password is required').exists(),
    ],
    authController.login
);

// Me route
router.get('/me', authMiddleware, authController.me);

// Log out route
router.post('/logout', authController.logout);

module.exports = router;