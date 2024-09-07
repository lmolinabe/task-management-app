const { check } = require('express-validator');
const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');
const authMiddleware = require('../middleware/AuthMiddleware');
const rateLimiter = require('../middleware/RateLimiter');

// Sign up route
router.post(
    '/signup',
    [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password is required').exists(),
        check('password', 'Password must be at least 8 characters long, contain one uppercase letter, one number, and one special character.')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, "i"),
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
    rateLimiter,
    authController.login
);

// Me route
router.get('/me', authMiddleware, authController.me);

// Log out route
router.post('/logout', authMiddleware, authController.logout);

// Refresh Token Route
router.post('/refresh-token', authController.refreshToken);

module.exports = router;