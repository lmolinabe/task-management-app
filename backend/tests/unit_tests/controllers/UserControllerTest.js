const bcrypt = require('bcryptjs');
const request = require('supertest');
const createTestApp = require('../../config/test-app');
const { connect, closeDatabase, clearDatabase } = require('../../config/test-db');
const User = require('../../../src/models/User');

// Mock user data for testing
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'TestPassword123!',
};

let accessToken;
let userId;

describe('User Controller', () => {
  beforeAll(async () => {
    await connect();
    app = createTestApp();

    // Hash the password before saving the user
    const saltRounds = 10;
    testUser.password = await bcrypt.hash(testUser.password, saltRounds);

    const user = await User.create(testUser);
    userId = user._id;

    // Log in the user to get an access token
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'TestPassword123!',
      });

    accessToken = res.body.accessToken;
  });

  afterAll(async () => {
    await clearDatabase();
    await closeDatabase();
  });

  describe('GET /api/users/profile', () => {
    it('should get the current user\'s profile', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('x-auth-token', accessToken);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('name', 'Test User');
      expect(res.body).toHaveProperty('email', 'test@example.com');
      expect(res.body).not.toHaveProperty('password'); // Password should not be returned
    });
  });

  describe('PUT /api/users/settings', () => {
    it('should update the current user\'s settings', async () => {
      const res = await request(app)
        .put('/api/users/settings')
        .set('x-auth-token', accessToken)
        .send({
          notifications: {
            dueSoon: true,
            overdue: false,
          },
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.notifications).toEqual({
        dueSoon: true,
        overdue: false,
      });
    });
  });
});