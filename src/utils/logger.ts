// src/utils/logger.ts
import pino from 'pino';

// Create a Pino instance with pretty printing
export const logger = pino({
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    transport: process.env.NODE_ENV === 'development'
        ? {
            target: 'pino-pretty',
            options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
                colorize: true,
                singleLine: false,  // Makes it multi-line and more readable
            },
        }
        : undefined,
    formatters: {
        level: (label: string) => {
            return { level: label };
        },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
});

// Export a child logger for specific modules
export const getChildLogger = (name: string) => {
    return logger.child({ module: name });
};

// Export the config for Fastify
export const loggerConfig = {
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    transport: process.env.NODE_ENV === 'development'
        ? {
            target: 'pino-pretty',
            options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
                colorize: true,
                singleLine: false,
            },
        }
        : undefined,
    formatters: {
        level: (label: string) => {
            return { level: label };
        },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
};