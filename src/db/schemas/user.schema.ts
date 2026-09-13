// src/db/schemas/user.schema.ts
import { z } from 'zod';

// Zod Schemas
// Update current user schema
export const updateMeSchema = z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters').optional(),
    username: z.string().min(3, 'Username must be at least 3 characters').optional(),
    bio: z.string().max(500, 'Bio must be less than 500 characters').optional().nullable(),
    avatarUrl: z.string().url('Invalid avatar URL').optional().nullable(),
    expertise: z.array(z.string()).optional(),
    preferences: z.object({
        notifications: z.boolean().optional(),
        language: z.string().optional(),
        theme: z.enum(['light', 'dark', 'system']).optional(),
    }).optional(),
});

// Admin update user schema (includes admin-only fields)
export const updateUserByIdSchema = updateMeSchema.extend({
    role: z.enum(['student', 'instructor', 'admin']).optional(),
    isActive: z.boolean().optional(),
    isVerified: z.boolean().optional(),
});

// Get user by ID params schema
export const getUserByIdParamsSchema = z.object({
    id: z.string().uuid('Invalid user ID format'),
});


//TYPES
export type UpdateMeInput = z.infer<typeof updateMeSchema>;
export type UpdateUserByIdInput = z.infer<typeof updateUserByIdSchema>;
export type GetUserByIdParams = z.infer<typeof getUserByIdParamsSchema>;


// Shared response schema
export const userResponseSchema = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        fullName: { type: 'string' },
        username: { type: 'string' },
        role: { type: 'string' },
        avatarUrl: { type: 'string', nullable: true },
        bio: { type: 'string', nullable: true },
        expertise: { type: 'array', items: { type: 'string' } },
        preferences: { type: 'object' },
        isVerified: { type: 'boolean' },
        isActive: { type: 'boolean' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
    },
};
// ERROR RESPONSE SCHEMA
const errorResponseSchema = {
    type: 'object',
    properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        errors: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    field: { type: 'string' },
                    message: { type: 'string' },
                },
            },
        },
    },
};


// Fastify Schema
// Get Current User Schema
export const CurrentUserFastifySchema = {
    tags: ['Users'],
    description: 'Get current authenticated user',
    security: [{ cookieAuth: [] }],
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                user: userResponseSchema,
            },
        },
        401: errorResponseSchema,
    },
};

// Update Current User Schema
export const updateMeFastifySchema = {
    tags: ['Users'],
    description: 'Update current user profile',
    security: [{ cookieAuth: [] }],
    body: {
        type: 'object',
        properties: {
            fullName: { type: 'string', minLength: 2 },
            username: { type: 'string', minLength: 3 },
            bio: { type: 'string', maxLength: 500, nullable: true },
            avatarUrl: { type: 'string', format: 'url', nullable: true },
            expertise: { type: 'array', items: { type: 'string' } },
            preferences: {
                type: 'object',
                properties: {
                    notifications: { type: 'boolean' },
                    language: { type: 'string' },
                    theme: { type: 'string', enum: ['light', 'dark', 'system'] },
                },
            },
        },
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                user: userResponseSchema,
            },
        },
        400: errorResponseSchema,
        401: errorResponseSchema,
        404: errorResponseSchema,
    },
};

// Get User By ID Schema
export const getUserByIdFastifySchema = {
    tags: ['Users'],
    description: 'Get user by ID',
    security: [{ cookieAuth: [] }],
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string', format: 'uuid' },
        },
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                user: userResponseSchema,
            },
        },
        401: errorResponseSchema,
        404: errorResponseSchema,
    },
};

// Update User By ID (Admin) Schema
export const updateUserByIdFastifySchema = {
    tags: ['Users'],
    description: 'Update user by ID (Admin only)',
    security: [{ cookieAuth: [] }],
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string', format: 'uuid' },
        },
    },
    body: {
        type: 'object',
        properties: {
            fullName: { type: 'string', minLength: 2 },
            username: { type: 'string', minLength: 3 },
            bio: { type: 'string', maxLength: 500, nullable: true },
            avatarUrl: { type: 'string', format: 'url', nullable: true },
            expertise: { type: 'array', items: { type: 'string' } },
            preferences: { type: 'object' },
            role: { type: 'string', enum: ['student', 'instructor', 'admin'] },
            isActive: { type: 'boolean' },
            isVerified: { type: 'boolean' },
        },
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                user: userResponseSchema,
            },
        },
        400: errorResponseSchema,
        401: errorResponseSchema,
        403: errorResponseSchema,
        404: errorResponseSchema,
    },
};