const bcrypt = require('bcryptjs');
const User = require('../../../src/models/User');
const request = require('supertest');
const createTestApp = require('../../config/test-app');
const { connect, closeDatabase, clearDatabase } = require('../../config/test-db');

// Mock user data for testing
const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'TestPassword123!',
};

let accessToken, refreshToken;

describe('Auth Controller', () => {
    let app;

    beforeAll(async () => {
        await connect();
        app = createTestApp();

        // Hash the password before saving the user
        const saltRounds = 10;
        testUser.password = await bcrypt.hash(testUser.password, saltRounds);

        await User.create(testUser);
    });

    afterAll(async () => {
        await clearDatabase();
        await closeDatabase();
    });

    describe('POST /api/auth/signup', () => {
        it('should create a new user', async () => {
            const res = await request(app)
                .post('/api/auth/signup')
                .send({
                    name: 'New User',
                    email: 'newuser@example.com',
                    password: 'NewPassword123!',
                });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('accessToken');
            expect(res.body).toHaveProperty('refreshToken');
        });

        it('should return 400 if user already exists', async () => {
            const res = await request(app)
                .post('/api/auth/signup')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'TestPassword123!',
                });

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('error', 'User already exists.');
        });

        it('should return 400 if email is invalid', async () => {
            const res = await request(app)
                .post('/api/auth/signup')
                .send({
                    name: 'Test User',
                    email: 'invalidemail',
                    password: 'TestPassword123!',
                });

            expect(res.statusCode).toBe(400);
        });
    });

    describe('POST /api/auth/login', () => {
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

            accessToken = res.body.accessToken;
            refreshToken = res.body.refreshToken;
        });

        it('should return 401 for invalid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'WrongPassword123!',
                });

            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty('error', 'Invalid credentials.');
        });
    });

    describe('GET /api/auth/me', () => {
        it('should get user information for authenticated user', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('x-auth-token', accessToken);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('name', 'Test User');
            expect(res.body).toHaveProperty('email', 'test@example.com');
            expect(res.body).not.toHaveProperty('password');
        });

        it('should return 401 for unauthorized requests', async () => {
            const res = await request(app).get('/api/auth/me');

            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty('error', 'No token, authorization denied.');
        });
    });

    describe('POST /api/auth/refresh-token', () => {
        it('should generate a new access token using a valid refresh token', async () => {
            const res = await request(app)
                .post('/api/auth/refresh-token')
                .send({ refreshToken });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('accessToken');
        });

        it('should return 401 if refresh token is missing', async () => {
            const res = await request(app).post('/api/auth/refresh-token');

            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty('error', 'Refresh token required.');
        });

        it('should return 403 if refresh token is invalid', async () => {
            const res = await request(app)
                .post('/api/auth/refresh-token')
                .send({ refreshToken: 'invalid-refresh-token' });

            expect(res.statusCode).toBe(403);
            expect(res.body).toHaveProperty('error', 'Invalid refresh token.');
        });
    });

    describe('POST /api/auth/logout', () => {
        it('should log out the user', async () => {
            const res = await request(app)
                .post('/api/auth/logout')
                .set('x-auth-token', accessToken);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('msg', 'Logged out successfully.');
        });
    });    
});