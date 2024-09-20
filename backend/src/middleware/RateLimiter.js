const rateLimit = require('express-rate-limit');

const rateLimitWindowTime = process.env.RATE_LIMIT_WINDOW_TIME || 1; // Default to 1 minute if not set
const loginAttempts = {};

// Combined middleware for rate limiting and login attempt tracking
const rateLimitLogin = (req, res, next) => {
  const ip = req.ip;
  if (!loginAttempts[ip]) {
    loginAttempts[ip] = { count: 0, startTime: null };
  }

  // Check if rate limit is exceeded
  if (loginAttempts[ip].count >= 5 &&
    Date.now() < loginAttempts[ip].startTime + rateLimitWindowTime * 60 * 1000
  ) {
    const retryAfter = Math.ceil(
      (loginAttempts[ip].startTime + rateLimitWindowTime * 60 * 1000 - Date.now()) / 1000
    );
    res.set('Retry-After', retryAfter);
    return res.status(429).json({
      error: 'Too many login attempts from this IP, please try again later.',
    });
  }

  // Attach a listener to the 'finish' event of the response
  res.on('finish', () => {
    if (res.statusCode === 401) {
      // Unauthorized (login failed)
      loginAttempts[ip].count++;
      if (loginAttempts[ip].count === 1) {
        loginAttempts[ip].startTime = Date.now();
      }
    } else if (res.statusCode === 200) {
      // Successful login
      delete loginAttempts[ip]; // Reset attempts on successful login
    }
  });

  next();
};

module.exports = rateLimitLogin;