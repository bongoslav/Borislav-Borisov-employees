import request from 'supertest';
import { Express } from 'express';
import { createTestApp } from '../testApp';
import { mockUserService } from '../setup';
import * as bcrypt from 'bcrypt';

describe('Auth API', () => {
    let app: Express;

    beforeEach(() => {
        jest.clearAllMocks();
        app = createTestApp();
    });

    describe('POST /api/v1/auth/register', () => {
        it('should register a new user successfully', async () => {
            const userData = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            };

            mockUserService.findByEmail.mockResolvedValue(null);
            mockUserService.create.mockResolvedValue({
                id: 1,
                name: userData.name,
                email: userData.email,
                password: 'hashedPassword'
            });

            const response = await request(app)
                .post('/api/v1/auth/register')
                .send(userData)
                .expect(200);

            expect(mockUserService.findByEmail).toHaveBeenCalledWith(userData.email);
            expect(mockUserService.create).toHaveBeenCalledWith(userData);
            expect(response.body).toEqual({
                user: {
                    id: 1,
                    name: userData.name,
                    email: userData.email
                }
            });
        });

        it('should return an error when user already exists', async () => {
            const userData = {
                name: 'Existing User',
                email: 'existing@example.com',
                password: 'password123'
            };

            mockUserService.findByEmail.mockResolvedValue({
                id: 1,
                name: userData.name,
                email: userData.email,
                password: 'hashedPassword'
            });

            await request(app)
                .post('/api/v1/auth/register')
                .send(userData)
                .expect(400);

            expect(mockUserService.findByEmail).toHaveBeenCalledWith(userData.email);
            expect(mockUserService.create).not.toHaveBeenCalled();
        });
    });

    describe('POST /api/v1/auth/login', () => {
        it('should login a user successfully', async () => {
            const credentials = {
                email: 'test@example.com',
                password: 'password123'
            };

            mockUserService.findByEmail.mockResolvedValue({
                id: 1,
                name: 'Test User',
                email: credentials.email,
                password: 'hashedPassword'
            });

            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            const response = await request(app)
                .post('/api/v1/auth/login')
                .send(credentials)
                .expect(200);

            expect(mockUserService.findByEmail).toHaveBeenCalledWith(credentials.email);
            expect(bcrypt.compare).toHaveBeenCalled();
            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('user');
            expect(response.body.user).toEqual({
                id: 1,
                name: 'Test User',
                email: credentials.email
            });
        });

        it('should return an error when user not found', async () => {
            const credentials = {
                email: 'notfound@example.com',
                password: 'password123'
            };

            mockUserService.findByEmail.mockResolvedValue(null);

            await request(app)
                .post('/api/v1/auth/login')
                .send(credentials)
                .expect(404);

            expect(mockUserService.findByEmail).toHaveBeenCalledWith(credentials.email);
            expect(bcrypt.compare).not.toHaveBeenCalled();
        });

        it('should return an error when password is invalid', async () => {
            const credentials = {
                email: 'test@example.com',
                password: 'wrongpassword'
            };

            mockUserService.findByEmail.mockResolvedValue({
                id: 1,
                name: 'Test User',
                email: credentials.email,
                password: 'hashedPassword'
            });

            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await request(app)
                .post('/api/v1/auth/login')
                .send(credentials)
                .expect(401);

            expect(mockUserService.findByEmail).toHaveBeenCalledWith(credentials.email);
            expect(bcrypt.compare).toHaveBeenCalled();
        });
    });
}); 