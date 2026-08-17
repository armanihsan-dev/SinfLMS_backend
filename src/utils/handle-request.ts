// src/utils/request-handler.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { ZodError } from 'zod';

// request handler wrapper
export async function handleRequest<T>(
    request: FastifyRequest,
    reply: FastifyReply,
    logic: () => Promise<T>
) {
    try {
        // Run the business logic
        const result = await logic();


        const response = {
            success: true,
            ...result,
        };

        return reply.send(response);
    } catch (error: any) {
        //  Handle Zod validation errors
        if (error instanceof ZodError) {
            return reply.status(400).send({
                success: false,
                message: 'Validation Error',
                errors: error.errors.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                })),
            });
        }

        //  Handle custom application errors
        if (error.statusCode) {
            return reply.status(error.statusCode).send({
                success: false,
                message: error.message,
            });
        }

        //  Handle unknown errors
        request.log.error(error);
        return reply.status(500).send({
            success: false,
            message: 'Internal Server Error',
        });
    }
}

// custom errors
export class AppError extends Error {
    constructor(
        public message: string,
        public statusCode: number = 400,
        public details?: any
    ) {
        super(message);
        this.name = 'AppError';
    }
}

// error factories
export const Errors = {
    conflict: (message: string = 'Resource already exists') =>
        new AppError(message, 409),

    notFound: (message: string = 'Resource not found') =>
        new AppError(message, 404),

    unauthorized: (message: string = 'Unauthorized') =>
        new AppError(message, 401),

    badRequest: (message: string = 'Bad request') =>
        new AppError(message, 400),

    internal: (message: string = 'Internal Server Error') =>
        new AppError(message, 500),
};