import 'reflect-metadata';
import { Container } from 'typedi';
import { PrismaClient } from '../../generated/prisma';

// Create a mock Prisma client
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

// Mock the PrismaClient
jest.mock('../../generated/prisma', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => mockPrisma),
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
});

beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
});

export { mockPrisma }; 