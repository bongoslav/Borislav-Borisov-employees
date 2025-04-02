import 'reflect-metadata';
import { Container } from 'typedi';
import { UserService } from '../services/UserService';

// First create the mock objects
const mockPrisma = {
    user: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    employee: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        upsert: jest.fn(),
    },
    project: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        upsert: jest.fn(),
    },
    employeeProject: {
        findMany: jest.fn(),
        upsert: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
};

// Create a mock UserService
const mockUserService = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
};

// Create a mock PrismaClient class that returns our mockPrisma
const MockPrismaClient = jest.fn(() => mockPrisma);

// Mock modules
jest.mock('../../generated/prisma', () => ({
    PrismaClient: MockPrismaClient
}));

// Mock UserService
jest.mock('../services/UserService', () => {
    return {
        UserService: jest.fn().mockImplementation(() => mockUserService)
    };
});

// Mock bcrypt
jest.mock('bcrypt', () => ({
    hash: jest.fn().mockResolvedValue('hashedPassword'),
    compare: jest.fn().mockResolvedValue(true),
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
    sign: jest.fn().mockReturnValue('test-token'),
    verify: jest.fn().mockReturnValue({ userId: 1 }),
}));

beforeAll(() => {
    // Reset container to clear dependencies between tests
    Container.reset();
    
    // Register mock UserService with the container
    Container.set(UserService, mockUserService);
});

beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
});

export { mockPrisma, mockUserService }; 