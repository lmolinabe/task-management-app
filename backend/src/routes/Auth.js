const { check } = require('express-validator');
const rateLimit = require('express-rate-limit');
const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');
const authMiddleware = require('../middleware/AuthMiddleware');

// Create a rate limiter middleware
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    msg: '{ "message": "Too many login attempts from this IP, please try again later." }',
  });

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
    loginLimiter,
    authController.login
);

// Me route
router.get('/me', authMiddleware, authController.me);

// Log out route
router.post('/logout', authMiddleware, authController.logout);

// Refresh Token Route
router.post('/refresh-token', authController.refreshToken);

module.exports = router;