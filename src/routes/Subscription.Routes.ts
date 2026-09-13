// src/modules/subscription/subscription.routes.ts
import { FastifyInstance } from 'fastify';
import { statusSchema, subscriptionSchema } from '../db/schemas/subscription.schema.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { handleRequest } from '../utils/handle-request.js';
import { subscriptionController } from '../controllers/subscription.controller.js';



export default async function subscriptionRoutes(fastify: FastifyInstance) {
    fastify.post('/create-checkout', {
        schema: subscriptionSchema,
        preHandler: [authenticate],
    }, async (request, reply) => {
        return handleRequest(request, reply, () =>
            subscriptionController.createCheckout(request, reply)
        );
    });

    fastify.get('/status', {
        schema: statusSchema,
        preHandler: [authenticate],
    }, async (request, reply) => {
        return handleRequest(request, reply, () =>
            subscriptionController.getStatus(request, reply)
        );
    });

    fastify.post('/cancel', {
        schema: {
            tags: ['Subscription'],
            description: 'Cancel subscription',
            security: [{ cookieAuth: [] }],
        },
        preHandler: [authenticate],
    }, async (request, reply) => {
        return handleRequest(request, reply, () =>
            subscriptionController.cancelSubscription(request, reply)
        );
    });
}