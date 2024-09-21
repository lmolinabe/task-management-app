const request = require('supertest');
const express = require('express');
const { validationResult } = require('express-validator');
// Mock the controllers, middleware, and rate limiter
jest.mock('../../../src/controllers/AuthController');
jest.mock('../../../src/middleware/AuthMiddleware');
jest.mock('../../../src/middleware/RateLimiter');
const authController = require('../../../src/controllers/AuthController');
const authMiddleware = require('../../../src/middleware/AuthMiddleware');
const rateLimiter = require('../../../src/middleware/RateLimiter');
authController.login.mockResolvedValue(Promise.resolve({}));
// Mock the rateLimiter function to simulate exceeding the limit
rateLimiter.mockImplementation(Promise.resolve({}));
const authRouter = require('../../../src/routes/Auth');

// Create a mock Express app
const app = express();
app.use(express.json());
app.use('/auth', authRouter);

describe('Auth Routes', () => {
  beforeEach(() => {
    // Reset mocks and rate limit counter before each test
    authController.signup.mockReset();
    authController.login.mockReset();
    authController.me.mockReset();
    authController.logout.mockReset();
    authController.refreshToken.mockReset();
    rateLimitCount = 0
  });

  describe('POST /auth/signup', () => {
    it('should sign up a new user with valid data', async () => {
      const newUser = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'NewPassword123!',
      };
      const createdTokens = { accessToken: 'TestAccessToken', refreshToken: 'TestRefreshToken' };
      authController.signup.mockImplementation(async (req, res) => {
        res.json(createdTokens);
      });
      const res = await request(app).post('/auth/signup').send(newUser);
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(createdTokens);
      expect(authController.signup).toHaveBeenCalled();
    });

    it('should return 400 for invalid email', async () => {
      const invalidUser = { email: 'invalid-email', password: 'password123' };
      authController.signup.mockImplementation(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
      });
      const res = await request(app).post('/auth/signup').send(invalidUser);
      expect(res.statusCode).toBe(400);
      expect(authController.signup).toHaveBeenCalled();
    });

    it('should return 400 for invalid password (too short)', async () => {
      const invalidUser = { email: 'test@example.com', password: 'pass' };
      authController.signup.mockImplementation(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
      });
      const res = await request(app).post('/auth/signup').send(invalidUser);
      expect(res.statusCode).toBe(400);
      expect(authController.signup).toHaveBeenCalled();
    });
  });

  describe('POST /auth/login', () => {
    it('should log in a user with valid credentials', async () => {
      const userCredentials = {
        email: 'newuser@example.com',
        password: 'NewPassword123!',
      };
      const createdTokens = { accessToken: 'TestAccessToken', refreshToken: 'TestRefreshToken' };
      // Mock the rateLimiter function to simulate exceeding the limit
      rateLimiter.mockImplementation(async (req, res, next) => {
        next();
      });
      authController.login.mockImplementation(async (req, res) => {
        res.json(createdTokens);   
      });
      const res = await request(app).post('/auth/login').send(userCredentials);
      expect(res.statusCode).toBe(200);
      // expect(res.body).toHaveProperty('token', mockToken);
      expect(res.body).toEqual(createdTokens);
      expect(authController.login).toHaveBeenCalled();
    });   

    it('should return 400 for invalid email', async () => {
      const invalidCredentials = { email: 'invalid-email', password: 'password123' };
      // Mock the rateLimiter function to simulate exceeding the limit
      rateLimiter.mockImplementation(async (req, res, next) => {
        next();
      });      
      authController.login.mockImplementation(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
      });
      const res = await request(app).post('/auth/login').send(invalidCredentials);
      expect(res.statusCode).toBe(400);
      expect(authController.login).toHaveBeenCalled();
    });

    it('should return 429 for too many login attempts', async () => {
      const validCredentials = { email: 'test@example.com', password: 'TestPassword1!' };
      const createdTokens = { accessToken: 'TestAccessToken', refreshToken: 'TestRefreshToken' };
      // Mock behavior for rateLimiter - initially allow requests
      let rateLimitCount = 0; 
      rateLimiter.mockImplementation(async (req, res, next) => {
        if (rateLimitCount >= 5) { 
          res.status(429).json({ message: 'Too many login attempts from this IP, please try again later.' });
        } else {
          rateLimitCount++;
          next();
        }
      });
      authController.login.mockImplementation(async (req, res) => {
        res.json(createdTokens);   
      });      
      // Make 6 requests (exceeding the limit)
      for (let i = 0; i < 6; i++) {
        await request(app).post('/auth/login').send(validCredentials);
      }
      const res = await request(app).post('/auth/login').send(validCredentials);
      expect(res.statusCode).toBe(429); 
      expect(res.body.message).toBe('Too many login attempts from this IP, please try again later.');
    });
  });

  describe('GET /auth/me', () => {
    it('should return user details for an authenticated user', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      authMiddleware.mockImplementation((req, res, next) => {
        req.userId = mockUser.id; 
        next();
      });
      authController.me.mockImplementation(async (req, res) => {
        res.json(mockUser);
      });
      const res = await request(app).get('/auth/me').set('x-auth-toke', 'test-token');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockUser);
      expect(authController.me).toHaveBeenCalled(); 
    });

    it('should return 401 for an unauthenticated user', async () => {
      authMiddleware.mockImplementation((req, res, next) => {
        const error = new Error('Unauthorized');
        error.statusCode = 401;
        next(error); 
      });
      const res = await request(app).get('/auth/me');
      expect(res.statusCode).toBe(401);
      expect(authController.me).not.toHaveBeenCalled();
    });
  });

  describe('POST /auth/logout', () => {
    it('should log out an authenticated user', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      authMiddleware.mockImplementation((req, res, next) => {
        req.userId = mockUser.id; 
        next();
      });    
      authController.logout.mockImplementation(async (req, res) => {
        res.status(200).json({ msg: 'Logged out successfully.' });
      });
      const res = await request(app).post('/auth/logout').set('x-auth-token', 'test-token');
      expect(res.statusCode).toBe(200);
      expect(res.body.msg).toBe('Logged out successfully.');
      expect(authController.logout).toHaveBeenCalled();
    });

    it('should return 401 for an unauthenticated user', async () => {
      authMiddleware.mockImplementation((req, res, next) => {
        const error = new Error('Unauthorized');
        error.statusCode = 401;
        next(error);
      });
      const res = await request(app).post('/auth/logout');
      expect(res.statusCode).toBe(401);
      expect(authController.logout).not.toHaveBeenCalled();
    });
  });

  describe('POST /auth/refresh-token', () => {
    it('should refresh the token for a valid request', async () => {
      const mockRefreshToken = 'your-refresh-token';
      const mockNewToken = 'your-new-jwt';
      authController.refreshToken.mockImplementation(async (req, res) => {
        res.json({ accessToken: mockNewToken });
      });
      const res = await request(app).post('/auth/refresh-token').send(mockRefreshToken);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('accessToken', mockNewToken);
      expect(authController.refreshToken).toHaveBeenCalled();
    });
  });
});
