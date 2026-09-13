// src/controllers/user.controller.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { db } from '../config/database.js';
import { users } from '../db/schema/users.schema.js';
import { eq } from 'drizzle-orm';
import { Errors } from '../utils/handle-request.js';
import { updateMeSchema, updateUserByIdSchema } from '../db/schemas/user.schema.js';


export class UserController {

    async getMe(request: FastifyRequest, reply: FastifyReply) {
        const user = request.user;
        if (!user) {
            throw Errors.unauthorized('Not authenticated');
        }
        return {
            message: 'User retrieved successfully',
            user: user,
        };
    }

    async updateMe(request: FastifyRequest, reply: FastifyReply) {
        const user = request.user;

        if (!user) {
            throw Errors.unauthorized('Not authenticated');
        }

        const validatedData = updateMeSchema.parse(request.body);

        // Update user
        const [updatedUser] = await db
            .update(users)
            .set({
                fullName: validatedData.fullName,
                username: validatedData.username,
                bio: validatedData.bio,
                avatarUrl: validatedData.avatarUrl,
                expertise: validatedData.expertise,
                preferences: validatedData.preferences,
                updatedAt: new Date(),
            })
            .where(eq(users.id, user.id))
            .returning({
                id: users.id,
                email: users.email,
                fullName: users.fullName,
                username: users.username,
                role: users.role,
                avatarUrl: users.avatarUrl,
                bio: users.bio,
                expertise: users.expertise,
                preferences: users.preferences,
                isVerified: users.isVerified,
                isActive: users.isActive,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
            });

        if (!updatedUser) {
            throw Errors.notFound('User not found');
        }

        return {
            message: 'User updated successfully',
            user: updatedUser,
        };
    }

    async getUserById(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };

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
                createdAt: users.createdAt,
            })
            .from(users)
            .where(eq(users.id, id))
            .limit(1);

        if (!user) {
            throw Errors.notFound('User not found');
        }

        return {
            message: 'User retrieved successfully',
            user: user,
        };
    }


    async updateUserById(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const currentUser = request.user;

        // Only admins can update other users
        if (currentUser.role !== 'admin' && currentUser.id !== id) {
            throw Errors.forbidden('You can only update your own profile');
        }

        const validatedData = updateUserByIdSchema.parse(request.body);

        // Build update object
        const updateData: any = {
            updatedAt: new Date(),
        };

        if (validatedData.fullName) updateData.fullName = validatedData.fullName;
        if (validatedData.username) updateData.username = validatedData.username;
        if (validatedData.bio !== undefined) updateData.bio = validatedData.bio;
        if (validatedData.avatarUrl !== undefined) updateData.avatarUrl = validatedData.avatarUrl;
        if (validatedData.expertise) updateData.expertise = validatedData.expertise;
        if (validatedData.preferences) updateData.preferences = validatedData.preferences;

        // Admin-only fields
        if (currentUser.role === 'admin') {
            if (validatedData.role) updateData.role = validatedData.role;
            if (validatedData.isActive !== undefined) updateData.isActive = validatedData.isActive;
            if (validatedData.isVerified !== undefined) updateData.isVerified = validatedData.isVerified;
        }

        const [updatedUser] = await db
            .update(users)
            .set(updateData)
            .where(eq(users.id, id))
            .returning({
                id: users.id,
                email: users.email,
                fullName: users.fullName,
                username: users.username,
                role: users.role,
                avatarUrl: users.avatarUrl,
                bio: users.bio,
                expertise: users.expertise,
                preferences: users.preferences,
                isVerified: users.isVerified,
                isActive: users.isActive,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
            });

        if (!updatedUser) {
            throw Errors.notFound('User not found');
        }

        return {
            message: 'User updated successfully',
            user: updatedUser,
        };
    }
}