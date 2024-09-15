const rateLimit = require('express-rate-limit');

const rateLimitWindowTime = process.env.RATE_LIMIT_WINDOW_TIME

const rateLimiter = rateLimit({
    windowMs: rateLimitWindowTime * 60 * 1000, // 15 minutes
    max: 5, 
    message: { error: 'Too many login attempts from this IP, please try again later.' }, // Corrected message format
});

module.exports = rateLimiter;