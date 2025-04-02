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

export function createTestApp(): Express {
    useContainer(Container);

    return createExpressServer({
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
} 