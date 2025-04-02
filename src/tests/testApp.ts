import 'reflect-metadata';
import { createExpressServer, useContainer } from 'routing-controllers';
import { Container } from 'typedi';
import { Express } from 'express';
import { authorizationChecker } from '../middlewares/authChecker';
import { LoggerMiddleware } from '../middlewares/loggerMiddleware';
import { ErrorHandlerMiddleware } from '../middlewares/errorHandler';

import { EmployeeController } from '../controllers/EmployeeController';
import { ProjectController } from '../controllers/ProjectController';
import { AnalyticsController } from '../controllers/AnalyticsController';
import { AuthController } from '../controllers/AuthController';

// This ensures we're using the container that's configured with mocks in the setup.ts
export function createTestApp(): Express {
    // Make sure to use the container with our mocks
    useContainer(Container);

    // Create server without connecting to the real database
    const app = createExpressServer({
        controllers: [
            EmployeeController,
            ProjectController,
            AnalyticsController,
            AuthController
        ],
        middlewares: [LoggerMiddleware, ErrorHandlerMiddleware],
        routePrefix: '/api/v1',
        authorizationChecker,
        defaultErrorHandler: false
    });

    return app;
} 