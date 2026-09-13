// src/routes/v1/user.routes.ts
import { FastifyInstance } from 'fastify';
import { UserController } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { handleRequest } from '../utils/handle-request.js';
import {
    CurrentUserFastifySchema,
    updateMeFastifySchema,
    getUserByIdFastifySchema,
    updateUserByIdFastifySchema,
} from '../db/schemas/user.schema.js';
import { requireRole } from '../middleware/role.middleware.js';

const userController = new UserController();

export default async function userRoutes(fastify: FastifyInstance) {

    // Get current user
    fastify.get('/me', {
        schema: CurrentUserFastifySchema,
        preHandler: [authenticate],
    }, async (request, reply) => {
        return handleRequest(request, reply, () =>
            userController.getMe(request, reply)
        );
    });

    // Update current user
    fastify.put('/me', {
        schema: updateMeFastifySchema,
        preHandler: [authenticate],
    }, async (request, reply) => {
        return handleRequest(request, reply, () =>
            userController.updateMe(request, reply)
        );
    });

    // Get user by ID
    fastify.get('/:id', {
        schema: getUserByIdFastifySchema,
        preHandler: [authenticate],
    }, async (request, reply) => {
        return handleRequest(request, reply, () =>
            userController.getUserById(request, reply)
        )
    });

    
    // Update user by ID (Admin only)
    fastify.put('/:id', {
        schema: updateUserByIdFastifySchema,
        preHandler: [authenticate, requireRole('admin')],
    }, async (request, reply) => {
        return handleRequest(request, reply, () =>
            userController.updateUserById(request, reply)
        )
    });
}