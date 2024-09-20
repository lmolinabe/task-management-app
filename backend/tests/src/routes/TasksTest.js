const bcrypt = require('bcryptjs');
const request = require('supertest');
const createTestApp = require('../../config/test-app');
const { connect, closeDatabase, clearDatabase } = require('../../config/test-db');
const Task = require('../../../src/models/Task');
const User = require('../../../src/models/User');
const moment = require('moment');

// Mock user data for testing
const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'TestPassword123!',
};

let accessToken;
let userId;

describe('Task Controller', () => {
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
        await clearDatabase();
    });

    afterAll(async () => {
        await closeDatabase();
    });

    describe('POST /api/tasks', () => {
        it('should create a new task', async () => {
            const newTask = {
                title: 'New Task',
                dueDate: '2024-03-10T10:00:00.000Z',
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
            expect(res.body).toHaveProperty('user', userId.toString()); // Check if user is assigned
        });

        it('should return 400 for invalid due date format', async () => {
            const newTask = {
                title: 'New Task',
                dueDate: '2024-03-10', // Invalid date format
                status: 'pending',
            };

            const res = await request(app)
                .post('/api/tasks')
                .set('x-auth-token', accessToken)
                .send(newTask);

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('errors');
            expect(res.body.errors[0].msg).toBe('Due date is required');
        });

        it('should return 400 for missing required fields', async () => {
            const newTask = {
                dueDate: '2024-03-10T10:00:00.000Z',
                status: 'pending',
            }; // Missing title

            const res = await request(app)
                .post('/api/tasks')
                .set('x-auth-token', accessToken)
                .send(newTask);

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('errors');
            expect(res.body.errors[0].msg).toBe('Title is required');
        });
    });

    describe('GET /api/tasks/:id', () => {
        it('should get a task by ID', async () => {
            const existingTask = await Task.create({
                title: 'Existing Task',
                dueDate: '2024-03-15T12:00:00.000Z',
                status: 'in-progress',
                user: userId,
            });

            const res = await request(app)
                .get(`/api/tasks/${existingTask._id}`)
                .set('x-auth-token', accessToken);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('title', existingTask.title);
            expect(res.body).toHaveProperty('dueDate', existingTask.dueDate.toISOString());
            expect(res.body).toHaveProperty('status', existingTask.status);
        });

        it('should return 404 if task not found', async () => {
            const res = await request(app)
                .get('/api/tasks/63f8a098b7c7d84f8c0f0000') // Invalid ID
                .set('x-auth-token', accessToken);

            expect(res.statusCode).toBe(404);
            expect(res.body).toHaveProperty('error', 'Task not found.');
        });
    });

    describe('PUT /api/tasks/:id', () => {
        it('should update a task by ID', async () => {
            const existingTask = await Task.create({
                title: 'Existing Task',
                dueDate: '2024-03-15T12:00:00.000Z',
                status: 'in-progress',
                user: userId,
            });

            const updatedTask = {
                title: 'Updated Task',
                dueDate: '2024-03-20T14:00:00.000Z',
                status: 'completed',
            };

            const res = await request(app)
                .put(`/api/tasks/${existingTask._id}`)
                .set('x-auth-token', accessToken)
                .send(updatedTask);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('title', updatedTask.title);
            expect(res.body).toHaveProperty('dueDate', updatedTask.dueDate);
            expect(res.body).toHaveProperty('status', updatedTask.status);
        });

        it('should return 404 if task not found', async () => {
            const updatedTask = {
                title: 'Updated Task',
                dueDate: '2024-03-20T14:00:00.000Z',
                status: 'completed',
            };

            const res = await request(app)
                .put('/api/tasks/63f8a098b7c7d84f8c0f0000') // Invalid ID
                .set('x-auth-token', accessToken)
                .send(updatedTask);

            expect(res.statusCode).toBe(404);
            expect(res.body).toHaveProperty('error', 'Task not found.');
        });
    });

    describe('DELETE /api/tasks/:id', () => {
        it('should delete a task by ID', async () => {
            const existingTask = await Task.create({
                title: 'Existing Task',
                dueDate: '2024-03-15T12:00:00.000Z',
                status: 'in-progress',
                user: userId,
            });

            const res = await request(app)
                .delete(`/api/tasks/${existingTask._id}`)
                .set('x-auth-token', accessToken);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('msg', 'Task deleted successfully.');

            // Verify that the task is actually deleted from the database
            const deletedTask = await Task.findById(existingTask._id);
            expect(deletedTask).toBeNull();
        });

        it('should return 404 if task not found', async () => {
            const res = await request(app)
                .delete('/api/tasks/63f8a098b7c7d84f8c0f0000') // Invalid ID
                .set('x-auth-token', accessToken);

            expect(res.statusCode).toBe(404);
            expect(res.body).toHaveProperty('error', 'Task not found.');
        });
    });
});