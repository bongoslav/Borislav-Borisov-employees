import request from 'supertest';
import { Express } from 'express';
import { Container } from 'typedi';
import { createTestApp } from '../testApp';
import { mockPrisma } from '../setup';
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

            mockPrisma.user.findUnique.mockResolvedValue(null);

            mockPrisma.user.create.mockResolvedValue({
                id: 1,
                name: userData.name,
                email: userData.email,
                password: 'hashedPassword'
            });

            const response = await request(app)
                .post('/api/v1/auth/register')
                .send(userData)
                .expect(200);

            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: userData.email }
            });
            expect(mockPrisma.user.create).toHaveBeenCalled();
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

            mockPrisma.user.findUnique.mockResolvedValue({
                id: 1,
                name: userData.name,
                email: userData.email,
                password: 'hashedPassword'
            });

            await request(app)
                .post('/api/v1/auth/register')
                .send(userData)
                .expect(400);

            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: userData.email }
            });
            expect(mockPrisma.user.create).not.toHaveBeenCalled();
        });
    });

    describe('POST /api/v1/auth/login', () => {
        it('should login a user successfully', async () => {
            const credentials = {
                email: 'test@example.com',
                password: 'password123'
            };

            mockPrisma.user.findUnique.mockResolvedValue({
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

            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: credentials.email }
            });
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

            mockPrisma.user.findUnique.mockResolvedValue(null);

            await request(app)
                .post('/api/v1/auth/login')
                .send(credentials)
                .expect(404);

            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: credentials.email }
            });
            expect(bcrypt.compare).not.toHaveBeenCalled();
        });

        it('should return an error when password is invalid', async () => {
            const credentials = {
                email: 'test@example.com',
                password: 'wrongpassword'
            };

            mockPrisma.user.findUnique.mockResolvedValue({
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

            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: credentials.email }
            });
            expect(bcrypt.compare).toHaveBeenCalled();
        });
    });
}); 