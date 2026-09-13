// src/routes/index.ts
import { FastifyInstance } from 'fastify';
import authRoutes from './Authentication.routes.js';
import userRoutes from './User.routes.js';
import subscriptionRoutes from './Subscription.Routes.js';


export default async function routes(fastify: FastifyInstance) {

    fastify.register(authRoutes, { prefix: '/auth' });
    fastify.register(userRoutes, { prefix: '/users' })
    await fastify.register(subscriptionRoutes, { prefix: '/subscription' });

}