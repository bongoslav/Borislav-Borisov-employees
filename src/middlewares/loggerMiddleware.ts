import { Middleware, ExpressMiddlewareInterface } from 'routing-controllers';
import { Service } from 'typedi';
import { Request, Response, NextFunction } from 'express';

@Service()
@Middleware({ type: 'before', priority: 100 })
export class LoggerMiddleware implements ExpressMiddlewareInterface {
	use(request: Request, response: Response, next: NextFunction): void {
		if (process.env.NODE_ENV === 'test') {
			return next();
		}

		const start = Date.now();
		const { method, url, ip } = request;

		console.log(`${method} ${url} - ${ip}`);

		if (request.body && Object.keys(request.body).length > 0) {
			console.log('Request body:', request.body);
		}

		response.on('finish', () => {
			const duration = Date.now() - start;
			const { statusCode } = response;

			console.log(`${method} ${url} ${statusCode} - ${duration}ms`);
		});

		next();
	}
} 
