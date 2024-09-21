const jwt = require('jsonwebtoken');
const AuthMiddleware = require('../../../src/middleware/AuthMiddleware');

const accessTokenSecret = process.env.JWT_SECRET || 'your_jwt_secret';

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      header: jest.fn(), // Mock the req.header function
    };
    res = {
      status: jest.fn(() => res), // Mock res.status to return res for chaining
      json: jest.fn(), // Mock res.json
    };
    next = jest.fn(); // Mock the next function
  });

  it('should return 401 if no token is provided', () => {
    req.header.mockReturnValue(undefined); // No token in the header

    AuthMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'No token, authorization denied.' });
    expect(next).not.toHaveBeenCalled(); // next() should not be called
  });

  it('should return 401 if the token is invalid', () => {
    const invalidToken = 'invalid-token';
    req.header.mockReturnValue(invalidToken);

    AuthMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token is not valid.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should decode the token and set req.userId if the token is valid', () => {
    const userId = 'test-user-id';
    const validToken = jwt.sign({ userId }, accessTokenSecret);
    req.header.mockReturnValue(validToken);

    AuthMiddleware(req, res, next);

    expect(req.userId).toBe(userId); // req.userId should be set
    expect(next).toHaveBeenCalled(); // next() should be called
  });
});