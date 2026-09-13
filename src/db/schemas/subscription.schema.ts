export const subscriptionSchema = {
    tags: ['Subscription'],
    description: 'Create subscription checkout',
    security: [{ cookieAuth: [] }],
    body: {
        type: 'object',
        required: ['plan'],
        properties: {
            plan: { type: 'string', enum: ['monthly', 'yearly'] },
            redirectUrl: { type: 'string' },
        },
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                checkoutUrl: { type: 'string' },
            },
        },
    },
};

export const statusSchema = {
    tags: ['Subscription'],
    description: 'Get instructor status',
    security: [{ cookieAuth: [] }],
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                isInstructor: { type: 'boolean' },
                isSubscribed: { type: 'boolean' },
                isVerified: { type: 'boolean' },
                subscriptionExpiresAt: { type: 'string' },
            },
        },
    },
};