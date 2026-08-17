// src/middleware/auth.middleware.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { sessionService } from '../services/session.service.js';
import { db } from '../config/database.js';
import { users } from '../db/schema/users.schema.js';
import { eq } from 'drizzle-orm';
import { Errors } from '../utils/handle-request.js';

export async function authenticate(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        // 1. Get session cookie
        const sessionToken = request.cookies['sessionId'];

        if (!sessionToken) {
            throw Errors.unauthorized('No session found. Please login.');
        }

        // 2. Validate session
        const session = await sessionService.validateSession(sessionToken);

        if (!session) {
            reply.clearCookie('sessionId', { path: '/' });
            throw Errors.unauthorized('Invalid or expired session. Please login.');
        }

        // 3. Get user from database
        const [user] = await db
            .select({
                id: users.id,
                email: users.email,
                fullName: users.fullName,
                username: users.username,
                role: users.role,
                avatarUrl: users.avatarUrl,
                bio: users.bio,
                expertise: users.expertise,
                isVerified: users.isVerified,
                isActive: users.isActive,
                lastLoginAt: users.lastLoginAt,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
            })
            .from(users)
            .where(eq(users.id, session.userId))
            .limit(1);

        if (!user) {
            throw Errors.unauthorized('User not found');
        }

        // 4. Check if user is active
        if (!user.isActive) {
            throw Errors.unauthorized('Account is deactivated');
        }

        // 5. Attach user and session to request
        request.user = user;
        request.session = session;
        request.sessionId = session.id;
        request.userId = user.id;
        request.sessionToken = sessionToken;

    } catch (error) {
        throw error;
    }
}

