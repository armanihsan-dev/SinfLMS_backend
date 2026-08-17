// src/utils/error-handler.ts
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';

// Custom error classes for better error handling
export class AppError extends Error {
    statusCode: number;
    code: string;
    details?: any;

    constructor(message: string, statusCode: number, code: string, details?: any) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.name = 'AppError';
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = 'Resource not found') {
        super(message, 404, 'NOT_FOUND');
    }
}

export class ValidationError extends AppError {
    constructor(message: string, details?: any) {
        super(message, 400, 'VALIDATION_ERROR', details);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string = 'Unauthorized') {
        super(message, 401, 'UNAUTHORIZED');
    }
}

export class ForbiddenError extends AppError {
    constructor(message: string = 'Forbidden') {
        super(message, 403, 'FORBIDDEN');
    }
}

// Global error handler setup
export function setupErrorHandler(fastify: FastifyInstance) {
    // 1. Handle 404 - Route not found
    fastify.setNotFoundHandler(async (request: FastifyRequest, reply: FastifyReply) => {
        return reply.status(404).send({
            success: false,
            error: {
                code: 'NOT_FOUND',
                message: `Route ${request.method} ${request.url} not found`,
                timestamp: new Date().toISOString(),
                path: request.url,
                method: request.method,
            },
        });
    });

    // 2. Global error handler - Catches all errors
    fastify.setErrorHandler(async (error: any, request: FastifyRequest, reply: FastifyReply) => {
        // Log the error
        fastify.log.error({
            error: {
                message: error.message,
                stack: error.stack,
                code: error.code,
                statusCode: error.statusCode,
            },
            request: {
                id: request.id,
                method: request.method,
                url: request.url,
                ip: request.ip,
                headers: request.headers,
            },
        });

        // Default error response
        let statusCode = error.statusCode || 500;
        let code = error.code || 'INTERNAL_SERVER_ERROR';
        let message = error.message || 'Internal server error';
        let details = error.details || undefined;

        // Handle Zod validation errors
        if (error instanceof ZodError) {
            statusCode = 400;
            code = 'VALIDATION_ERROR';
            message = 'Validation error';
            details = error.errors.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
            }));
        }

        // Handle Fastify validation errors
        if (error.validation) {
            statusCode = 400;
            code = 'VALIDATION_ERROR';
            message = 'Request validation failed';
            details = error.validation.map((err: any) => ({
                field: err.params?.missingProperty || err.instancePath || 'unknown',
                message: err.message,
            }));
        }

        // Handle custom AppError
        if (error instanceof AppError) {
            statusCode = error.statusCode;
            code = error.code;
            message = error.message;
            details = error.details;
        }

        // Handle rate limit errors
        if (error.statusCode === 429) {
            code = 'RATE_LIMIT_EXCEEDED';
            message = 'Too many requests, please try again later';
        }

        // Handle database errors
        if (error.code === '23505') { // PostgreSQL unique violation
            statusCode = 409;
            code = 'DUPLICATE_ENTRY';
            message = 'Duplicate entry found';
            details = error.detail;
        }

        // Production vs Development error details
        const isDevelopment = process.env.NODE_ENV === 'development';

        const response = {
            success: false,
            error: {
                code,
                message,
                ...(details && { details }),
                ...(isDevelopment && {
                    stack: error.stack,
                    ...(error.cause && { cause: error.cause }),
                }),
            },
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            requestId: request.id,
        };

        return reply.status(statusCode).send(response);
    });

    // 3. Handle uncaught exceptions (outside Fastify)
    process.on('uncaughtException', (error) => {
        fastify.log.error({
            event: 'uncaughtException',
            error: {
                message: error.message,
                stack: error.stack,
            },
        });
        // In production, you might want to restart the process
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
    });

    // 4. Handle unhandled promise rejections
    process.on('unhandledRejection', (reason) => {
        fastify.log.error({
            event: 'unhandledRejection',
            reason,
        });
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
    });
}