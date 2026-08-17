// src/schemas/auth.schema.ts
import { z } from 'zod';

// ZOD schemas
export const registerSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    username: z.string().min(3, 'Username must be at least 3 characters').optional(),
    rememberMe: z.boolean().default(false),
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
    rememberMe: z.boolean().default(false),
});

export const userResponseSchema = z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    fullName: z.string(),
    username: z.string().nullable(),
    role: z.string(),
    createdAt: z.string().datetime().optional(),
});

export const errorResponseSchema = z.object({
    success: z.boolean(),
    message: z.string(),
    errors: z.array(z.object({
        field: z.string(),
        message: z.string(),
    })).optional(),
});


//Schemas For fastify Routes
export const registerFastifySchema = {
    tags: ['Authentication'],
    description: 'Register a new user',
    body: {
        type: 'object',
        required: ['email', 'password', 'fullName'],
        properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8 },
            fullName: { type: 'string' },
            username: { type: 'string' },
            rememberMe: { type: 'boolean' },
        },
    },
    response: {
        201: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                user: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        email: { type: 'string' },
                        fullName: { type: 'string' },
                        username: { type: 'string' },
                        role: { type: 'string' },
                    },
                },
            },
        },
        400: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                errors: { type: 'array' },
            },
        },
        409: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
            },
        },
    },
}
export const loginFastifySchema = {
    tags: ['Authentication'],
    description: 'Login user',
    body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
            rememberMe: { type: 'boolean' },
        },
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                user: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                        fullName: { type: 'string' },
                        username: { type: ['string', 'null'] },
                        role: { type: 'string' },
                        avatarUrl: { type: ['string', 'null'] },
                        bio: { type: ['string', 'null'] },
                        isVerified: { type: 'boolean' },
                    },
                    additionalProperties: true,
                }
            },
        },
        400: {
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
        },
        401: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
            },
        },
    }
};
export const loginWithGoogleFastifySchema = {
    tags: ['Authentication'],
    description: 'Login/Register with Google',
    body: {
        type: 'object',
        required: ['token'],
        properties: {
            token: { type: 'string' },
        },
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                user: { type: 'object' },
            },
        },
    },
}
export const CurrentUserFastifySchema = {
    tags: ['Authentication'],
    description: 'Get current authenticated user',
    security: [{ cookieAuth: [] }],
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                user: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        email: { type: 'string' },
                        fullName: { type: 'string' },
                        username: { type: 'string' },
                        role: { type: 'string' },
                        avatarUrl: { type: 'string' },
                        bio: { type: 'string' },
                        expertise: { type: 'array', items: { type: 'string' } },
                        isVerified: { type: 'boolean' },
                        isActive: { type: 'boolean' },
                        lastLoginAt: { type: 'string' },
                        createdAt: { type: 'string' },
                        updatedAt: { type: 'string' },
                    },
                },
            },
        },
        401: {
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
        },
    },
};
export const logoutFastifySchema = {
    tags: ['Authentication'],
    description: 'Logout user - revokes session and clears cookie',
    security: [{ cookieAuth: [] }],
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
            },
        },
        401: {
            type: 'object',
            properties: {
                success: {
                    type: 'boolean',
                    default: false
                },
                message: {
                    type: 'string'
                },
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
            }
        }
    },
}
export const loginWithGithubFastifySchema = {
    tags: ['Authentication'],
    description: 'Login with GitHub',
    body: {
        type: 'object',
        required: ['token'],
        properties: {
            token: { type: 'string' },
        },
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                user: { type: 'object' },
            },
        },
        400: { $ref: 'ErrorResponse' },
        401: { $ref: 'ErrorResponse' },
    },
};


// Types
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;