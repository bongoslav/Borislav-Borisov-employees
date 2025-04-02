import { Middleware, ExpressErrorMiddlewareInterface } from 'routing-controllers';
import { Service } from 'typedi';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

@Service()
@Middleware({ type: 'after' })
export class ErrorHandlerMiddleware implements ExpressErrorMiddlewareInterface {
    error(error: any, request: Request, response: Response, next: NextFunction): void {
        const status = error.httpCode || error.status || 500;
        const message = error.message || 'Something went wrong';

        logger.error(`${status} - ${message}`, error);

        const errorResponse = {
            success: false,
            status,
            message
        };

        if (error.errors) {
            (errorResponse as any).errors = error.errors;
        }

        response.status(status).json(errorResponse);
    }
} 