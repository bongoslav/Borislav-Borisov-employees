import { Middleware, ExpressMiddlewareInterface } from 'routing-controllers';
import { Service } from 'typedi';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

@Service()
@Middleware({ type: 'before', priority: 100 })
export class LoggerMiddleware implements ExpressMiddlewareInterface {
  use(request: Request, response: Response, next: NextFunction): void {
    const start = Date.now();
    const { method, url, ip } = request;
    
    logger.info(`${method} ${url} - ${ip}`);
    
    if (request.body && Object.keys(request.body).length > 0) {
      logger.debug('Request body:', request.body);
    }
    
    response.on('finish', () => {
      const duration = Date.now() - start;
      const { statusCode } = response;
      
      logger.info(`${method} ${url} ${statusCode} - ${duration}ms`);
    });
    
    next();
  }
} 
