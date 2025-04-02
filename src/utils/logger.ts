import * as winston from 'winston';
import { Service } from 'typedi';

const { combine, timestamp, printf, colorize } = winston.format;

const logFormat = printf(({ level, message, timestamp }) => {
    return `[${timestamp}] ${level}: ${message}`;
});

@Service()
class Logger {
    private logger: winston.Logger;

    constructor() {
        this.logger = winston.createLogger({
            level: process.env.LOG_LEVEL || 'info',
            format: combine(
                timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                colorize(),
                logFormat
            ),
            transports: [
                new winston.transports.Console()
            ]
        });
    }

    info(message: string, meta?: any): void {
        this.logger.info(message, meta);
    }

    error(message: string, meta?: any): void {
        this.logger.error(message, meta);
    }

    warn(message: string, meta?: any): void {
        this.logger.warn(message, meta);
    }

    debug(message: string, meta?: any): void {
        this.logger.debug(message, meta);
    }
}

export const logger = new Logger(); 