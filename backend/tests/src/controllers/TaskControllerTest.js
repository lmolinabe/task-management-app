const bcrypt = require('bcryptjs');
const request = require('supertest');
const createTestApp = require('../../config/test-app');
const { connect, closeDatabase, clearDatabase } = require('../../config/test-db');
const Task = require('../../../src/models/Task');
const User = require('../../../src/models/User');

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
            const res = await request(app)
                .post('/api/tasks')
                .set('x-auth-token', accessToken)
                .send({
                    title: 'Test Task',
                    description: 'This is a test task',
                    dueDate: '2024-04-10',
                    status: 'pending',
                });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('_id');
            expect(res.body.title).toBe('Test Task');
            expect(res.body.user).toEqual(userId.toString());
        });

        it('should return 400 for missing required fields', async () => {
            const res = await request(app)
                .post('/api/tasks')
                .set('x-auth-token', accessToken)
                .send({
                    description: 'This is a test task',
                    dueDate: '2024-04-10',
                    status: 'pending',
                });

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('errors');
        });
    });

    describe('GET /api/tasks', () => {
        beforeEach(async () => {
            // Create some test tasks in the database
            await Task.create([
                { title: 'Task 1', dueDate: '2024-04-08', status: 'pending', user: userId },
                { title: 'Task 2', dueDate: '2024-04-15', status: 'in-progress', user: userId },
                { title: 'Task 3', dueDate: '2024-04-20', status: 'completed', user: userId },
            ]);
        });

        it('should get all tasks for the authenticated user', async () => {
            const res = await request(app)
                .get('/api/tasks')
                .set('x-auth-token', accessToken);

            expect(res.statusCode).toBe(200);
            expect(res.body.data).toHaveLength(3);
        });

        it('should filter tasks by status', async () => {
            const res = await request(app)
                .get('/api/tasks?status=pending')
                .set('x-auth-token', accessToken);

            expect(res.statusCode).toBe(200);
            expect(res.body.data).toHaveLength(1);
            expect(res.body.data[0].status).toBe('pending');
        });

        it('should sort tasks by due date', async () => {
            const res = await request(app)
                .get('/api/tasks?sortBy=dueDate&sortOrder=desc')
                .set('x-auth-token', accessToken);

            expect(res.statusCode).toBe(200);
            expect(res.body.data[0].title).toBe('Task 3'); // Task 3 has the latest due date
        });

        it('should paginate tasks', async () => {
            const res = await request(app)
                .get('/api/tasks?page=2&limit=1')
                .set('x-auth-token', accessToken);

            expect(res.statusCode).toBe(200);
            expect(res.body.data).toHaveLength(1);
            expect(res.body.currentPage).toBe(2);
        });
    });

    describe('GET /api/tasks/:id', () => {
        it('should get a specific task by ID', async () => {
            const newTask = await Task.create({
                title: 'Test Task',
                dueDate: '2024-04-10',
                status: 'pending',
                user: userId,
            });

            const res = await request(app)
                .get(`/api/tasks/${newTask._id}`)
                .set('x-auth-token', accessToken);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('_id', newTask._id.toString());
            expect(res.body.title).toBe('Test Task');
        });

        it('should return 404 if task is not found', async () => {
            const invalidTaskId = '000000000000000000000000';
            const res = await request(app)
                .get(`/api/tasks/${invalidTaskId}`)
                .set('x-auth-token', accessToken);

            expect(res.statusCode).toBe(404);
            expect(res.body).toHaveProperty('error', 'Task not found.');
        });
    });

    describe('PUT /api/tasks/:id', () => {
        it('should update a specific task by ID', async () => {
            const newTask = await Task.create({
                title: 'Test Task',
                dueDate: '2024-04-10',
                status: 'pending',
                user: userId,
            });

            const res = await request(app)
                .put(`/api/tasks/${newTask._id}`)
                .set('x-auth-token', accessToken)
                .send({
                    title: 'Updated Task Title',
                    status: 'in-progress',
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.title).toBe('Updated Task Title');
            expect(res.body.status).toBe('in-progress');
        });

        it('should return 404 if task is not found', async () => {
            const invalidTaskId = '000000000000000000000000';
            const res = await request(app)
                .put(`/api/tasks/${invalidTaskId}`)
                .set('x-auth-token', accessToken)
                .send({
                    title: 'Updated Task Title',
                    status: 'in-progress',
                });

            expect(res.statusCode).toBe(404);
            expect(res.body).toHaveProperty('error', 'Task not found.');
        });
    });

    describe('DELETE /api/tasks/:id', () => {
        it('should delete a specific task by ID', async () => {
            const newTask = await Task.create({
                title: 'Test Task',
                dueDate: '2024-04-10',
                status: 'pending',
                user: userId,
            });

            const res = await request(app)
                .delete(`/api/tasks/${newTask._id}`)
                .set('x-auth-token', accessToken);

            expect(res.statusCode).toBe(200);
            expect(res.body.msg).toBe('Task deleted successfully.');

            const deletedTask = await Task.findById(newTask._id);
            expect(deletedTask).toBeNull();
        });

        it('should return 404 if task is not found', async () => {
            const invalidTaskId = '000000000000000000000000';
            const res = await request(app)
                .delete(`/api/tasks/${invalidTaskId}`)
                .set('x-auth-token', accessToken);

            expect(res.statusCode).toBe(404);
            expect(res.body).toHaveProperty('error', 'Task not found.');
        });
    });
});