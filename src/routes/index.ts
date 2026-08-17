// src/routes/index.ts
import { FastifyInstance } from 'fastify';
import authRoutes from './Authentication.routes.js';


export default async function routes(fastify: FastifyInstance) {
    // Register all v1 routes with /api/v1 prefix
    fastify.register(authRoutes, { prefix: '/auth' });

    // Future routes will go here:
    // fastify.register(userRoutes, { prefix: '/users' });
    // fastify.register(courseRoutes, { prefix: '/courses' });
}