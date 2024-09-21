const rateLimiter = require('../../../src/middleware/RateLimiter'); 

describe('Rate Limiter Middleware', () => {
  it('should return the rateLimit middleware function', () => {    
    // Get the middleware function returned by rateLimiter
    const middleware = rateLimiter;
    // Check if it's a function (as middleware should be)
    expect(typeof middleware).toBe('function'); 
  });
});