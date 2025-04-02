import 'reflect-metadata';
import { createExpressServer, useContainer } from 'routing-controllers';
import { Container } from 'typedi';
import * as dotenv from 'dotenv';

dotenv.config();

import { authorizationChecker } from './middlewares/authChecker';
import { PrismaClient } from '../generated/prisma';
import { logger } from './utils/logger';
import { LoggerMiddleware } from './middlewares/loggerMiddleware';
import { ErrorHandlerMiddleware } from './middlewares/errorHandler';

import { EmployeeController } from './controllers/EmployeeController';
import { ProjectController } from './controllers/ProjectController';
import { AnalyticsController } from './controllers/AnalyticsController';
import { AuthController } from './controllers/AuthController';

export const prisma = new PrismaClient();

useContainer(Container);

const app = createExpressServer({
  controllers: [EmployeeController, ProjectController, AnalyticsController, AuthController],
  middlewares: [LoggerMiddleware, ErrorHandlerMiddleware],
  routePrefix: '/api/v1',
  authorizationChecker,
  defaultErrorHandler: false
});

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await prisma.$connect();
    logger.info('Database connection established');
    
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Error connecting to database:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

startServer();
