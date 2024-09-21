const request = require('supertest');
const createTestApp = require('../config/test-app');
const { connect, closeDatabase, clearDatabase } = require('../config/test-db');
const Task = require('../../src/models/Task');
const User = require('../../src/models/User');
const bcrypt = require('bcryptjs');
const moment = require('moment');

// Mock user data for testing
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'TestPassword123!',
};

let app, accessToken, userId;

describe('Task Management API Integration Tests', () => {
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

  afterEach(async () => {
    await Task.collection.drop();
  });


  afterAll(async () => {
    await clearDatabase();
    await closeDatabase();
  });

  describe('Authentication Endpoints', () => {
    it('should sign up a new user', async () => {
      const newUser = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'NewPassword123!',
      };

      const res = await request(app).post('/api/auth/signup').send(newUser);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
    });

    it('should log in an existing user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'TestPassword123!',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
    });

    it('should refresh the access token using a valid refresh token', async () => {
      const storedUser = await User.findOne({ email: 'test@example.com' });
      const refreshToken = storedUser.refreshToken;

      const res = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
    });

    it('should log out an authenticated user', async () => {
        const res = await request(app)
          .post('/api/auth/logout')
          .set('x-auth-token', accessToken);
  
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('msg', 'Logged out successfully.');
      });    
  });

  describe('Task Endpoints', () => {
    it('should create a new task', async () => {
      const newTask = {
        title: 'Test Task',
        dueDate: '2024-01-01T12:00:00.000Z',
        status: 'pending',
      };

      const res = await request(app)
        .post('/api/tasks')
        .set('x-auth-token', accessToken)
        .send(newTask);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('title', newTask.title);
      expect(res.body).toHaveProperty('dueDate', newTask.dueDate);
      expect(res.body).toHaveProperty('status', newTask.status);
      expect(res.body).toHaveProperty('user', userId.toString());
    });

    it('should get all tasks for the authenticated user', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('x-auth-token', accessToken);

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('should get a task by ID', async () => {
      const createdTask = await Task.create({
        title: 'Get Task by ID',
        dueDate: '2024-01-05T12:00:00.000Z',
        status: 'pending',
        user: userId,
      });

      const res = await request(app)
        .get(`/api/tasks/${createdTask._id}`)
        .set('x-auth-token', accessToken);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('title', createdTask.title);
    });

    it('should update a task by ID', async () => {
      const createdTask = await Task.create({
        title: 'Update Task',
        dueDate: '2024-01-10T12:00:00.000Z',
        status: 'pending',
        user: userId,
      });

      const updatedTask = {
        title: 'Updated Task Title',
        dueDate: '2024-01-10T12:00:00.000Z',
        status: 'completed',
      };

      const res = await request(app)
        .put(`/api/tasks/${createdTask._id}`)
        .set('x-auth-token', accessToken)
        .send(updatedTask);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('title', updatedTask.title);
      expect(res.body).toHaveProperty('status', updatedTask.status);
    });

    it('should delete a task by ID', async () => {
      const createdTask = await Task.create({
        title: 'Delete Task',
        dueDate: '2024-01-15T12:00:00.000Z',
        status: 'pending',
        user: userId,
      });

      const res = await request(app)
        .delete(`/api/tasks/${createdTask._id}`)
        .set('x-auth-token', accessToken);

      expect(res.statusCode).toBe(200);

      const deletedTask = await Task.findById(createdTask._id);
      expect(deletedTask).toBeNull();
    });

    it('should return a summary of tasks for the authenticated user', async () => {
      // Create some test tasks
      const currentDate = moment().utc();
      const dueSoonDate = moment().utc().add(24, 'hours');
      const overdueDate = moment().utc().subtract(1, 'day');

      // Create tasks with separate dueSoonDate copies
      await Task.create({ title: 'On Time Task', dueDate: dueSoonDate.clone().add(1, 'day').toDate(), status: 'pending', user: userId });
      await Task.create({ title: 'Due Soon Task', dueDate: dueSoonDate.clone().toDate(), status: 'pending', user: userId });
      await Task.create({ title: 'Completed Task', dueDate: currentDate.toDate(), status: 'completed', user: userId });
      await Task.create({ title: 'Overdue Task', dueDate: overdueDate.toDate(), status: 'pending', user: userId });

      // Wait for the summary request
      const res = await request(app)
          .get('/api/tasks/summary')
          .set('x-auth-token', accessToken);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
          totalTasks: 4,
          onTimeTasks: 1,
          dueSoonTasks: 1,
          completedTasks: 1,
          overdueTasks: 1,
      });
  });
  });

  describe('User Endpoints', () => {
    it('should get the current user\'s profile', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('x-auth-token', accessToken);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('name', 'Test User');
      expect(res.body).toHaveProperty('email', 'test@example.com');
      expect(res.body).not.toHaveProperty('password'); // Password should not be returned
    });

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