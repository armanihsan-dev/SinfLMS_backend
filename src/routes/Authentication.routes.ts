// src/routes/v1/auth.routes.ts
import { FastifyInstance } from 'fastify';
import { CurrentUserFastifySchema, loginFastifySchema, LoginInput, loginWithGithubFastifySchema, loginWithGoogleFastifySchema, logoutFastifySchema, registerFastifySchema, RegisterInput } from '../db/schemas/auth.schema.js';
import { AuthController } from '../controllers/auth.controller.js';
import { handleRequest } from '../utils/handle-request.js';
import { authenticate } from '../middleware/auth.middleware.js';




const authController = new AuthController()


export default async function authRoutes(fastify: FastifyInstance) {
    // Register route
    fastify.post<{ Body: RegisterInput }>('/register', {
        schema: registerFastifySchema
    }, async (request, reply) => {
        return handleRequest(request, reply, () =>
            authController.register(request, reply)
        );
    });

    // Login route
    fastify.post<{ Body: LoginInput }>('/login', { schema: loginFastifySchema }, async (request, reply) => {
        return handleRequest(request, reply, () =>
            authController.login(request, reply)
        );
    });

    fastify.post('/google', { schema: loginWithGoogleFastifySchema }, async (request, reply) => {
        return handleRequest(request, reply, () =>
            authController.googleLogin(request, reply)
        );
    })



    fastify.get('/github/callback', async (request, reply) => {
        const { code, error } = request.query as { code?: string; error?: string };

        // Handle error from GitHub
        if (error) {
            return reply.redirect(`${process.env.FRONTEND_URL}/login?error=${error}`);
        }

        // Handle missing code
        if (!code) {
            return reply.redirect(`${process.env.FRONTEND_URL}/login?error=no_code`);
        }

        // Create a fake request body with the code
        request.body = { code };

        // Call the existing githubLogin method
        await authController.githubLogin(request, reply);

        // After githubLogin sets the cookie, redirect to frontend dashboard
        return reply.redirect(`${process.env.FRONTEND_URL}/dashboard`);

    });

    // Get current user
    fastify.get('/me', { schema: CurrentUserFastifySchema, preHandler: [authenticate] }, async (request, reply) => {
        return handleRequest(request, reply, () =>
            authController.me(request, reply)
        );
    });

    fastify.post('/logout', { schema: logoutFastifySchema, preHandler: [authenticate] }, async (request, reply) => {
        return handleRequest(request, reply, () =>
            authController.logout(request, reply)
        );
    })
}