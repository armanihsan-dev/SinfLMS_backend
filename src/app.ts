// src/app.ts
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import compress from '@fastify/compress';
import rateLimit from '@fastify/rate-limit';
import dotenv from 'dotenv';
import { loggerConfig } from './utils/logger.js';
import { setupErrorHandler } from './utils/error-handler.js';
import fastifyRedis from '@fastify/redis';
import fastifyCookie from '@fastify/cookie';
import { authenticate } from './middleware/auth.middleware.js';
import routes from './routes/index.js';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import lemonSqueezyWebhook from './webhooks/lemon-squeezy.webhook.js';

// Load environment variables
dotenv.config();

export async function buildApp() {
    const fastify = Fastify({
        logger: loggerConfig,  // Use the config
        trustProxy: true,
        routerOptions: {        // Use routerOptions instead
            ignoreTrailingSlash: true,
            caseSensitive: true,
        },
        bodyLimit: 1048576, // 1MB
        requestIdHeader: 'x-request-id',
        genReqId: (req) => req.headers['x-request-id']?.toString() || crypto.randomUUID(),
    });

    // ==================== PLUGINS ====================

    try {
        await fastify.register(fastifyRedis, {
            url: process.env.REDIS_URL,
            closeClient: true, // ✅ Auto-close on server shutdown
        });
        fastify.log.info('✅ Redis connected successfully');
    } catch (err) {
        fastify.log.error('❌ Failed to connect to Redis:', err as any);
    }

    await fastify.register(fastifyCookie, {
        secret: process.env.COOKIE_SECRET || 'my-secret-key', // For signed cookies
        parseOptions: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
        },
    })


    fastify.decorateRequest('session', null);
    fastify.decorateRequest('userId', null);
    fastify.decorateRequest('user', null);
    fastify.decorateRequest('sessionId', null);

    fastify.decorate('authenticate', authenticate);

    // CORS - Security
    await fastify.register(cors, {
        origin: (origin, cb) => {
            const allowedOrigins = [
                'http://localhost:3000',
                'http://localhost:3001',
                'http://localhost:5173',
                'http://localhost:5174'
            ];
            if (!origin || allowedOrigins.includes(origin)) {
                cb(null, true);
            } else {
                cb(new Error('Not allowed by CORS'), false);
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
    });

    // Helmet - Security headers
    await fastify.register(helmet, {
        contentSecurityPolicy: process.env.NODE_ENV === 'production',
        hidePoweredBy: true,
        hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true,
        },
    });

    // Compression
    await fastify.register(compress, {
        threshold: 1024,
        encodings: ['gzip', 'deflate'],
    });

    // Rate Limiting
    await fastify.register(rateLimit, {
        max: 10,
        timeWindow: '1 minute',
        keyGenerator: (req) => req.ip,
        errorResponseBuilder: (req, context) => ({
            success: false,
            message: 'Too many requests, please try again later',
            retryAfter: context.after,
        }),
    });

    // src/app.ts (Swagger registration section)

    await fastify.register(fastifySwagger, {
        openapi: {
            openapi: '3.0.0',
            info: {
                title: 'SinfLMS API',
                version: '1.0.0',
                description: 'Learning Management System API',
            },
            servers: [
                {
                    url: `http://localhost:${process.env.PORT || 3900}`,
                    description: 'Development server',
                },
            ],
            tags: [
                { name: 'System', description: 'System endpoints' },
                { name: 'Authentication', description: 'Authentication endpoints' },
                { name: 'Users', description: 'User management endpoints' },
                { name: 'Courses', description: 'Course management endpoints' },
            ],
            components: {
                securitySchemes: {
                    cookieAuth: {
                        type: 'apiKey',
                        in: 'cookie',
                        name: 'sessionId',
                        description: 'Session cookie (HttpOnly, Secure)',
                    },
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT',
                        description: 'JWT token for API access',
                    },
                },
            },
        },
    });

    await fastify.register(fastifySwaggerUi, {
        routePrefix: '/docs',
        uiConfig: {
            docExpansion: 'list',
            deepLinking: true,
        },
    });

    setupErrorHandler(fastify)
    await fastify.register(lemonSqueezyWebhook)
    await fastify.register(routes, { prefix: '/api/v1' })


    // ==================== HEALTH ROUTE ====================
    fastify.get('/health', {
        schema: {
            tags: ['System'],
            description: 'Health check endpoint',
            response: {
                200: {
                    type: 'object',
                    properties: {
                        status: { type: 'string' },
                        timestamp: { type: 'string' },
                        uptime: { type: 'number' },
                        memory: {
                            type: 'object',
                            properties: {
                                rss: { type: 'number' },
                                heapTotal: { type: 'number' },
                                heapUsed: { type: 'number' },
                            },
                        },
                        environment: { type: 'string' },
                    },
                },
            },
        },
    }, async (request, reply) => {
        const memory = process.memoryUsage();
        return {
            status: 'OK',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: {
                rss: Math.round(memory.rss / 1024 / 1024),
                heapTotal: Math.round(memory.heapTotal / 1024 / 1024),
                heapUsed: Math.round(memory.heapUsed / 1024 / 1024),
            },
            environment: process.env.NODE_ENV || 'development',
            version: '1.0.0',
        };
    });

    // ==================== ROOT ROUTE ====================
    fastify.get('/', {
        schema: {
            tags: ['System'],
            description: 'API information',
        },
    }, async (request, reply) => {
        return {
            name: 'sinfLMS API',
            version: '1.0.0',
            description: 'Learning Management System API',
            environment: process.env.NODE_ENV || 'development',
            docs: '/docs',
            health: '/health',
            endpoints: {
                base: '/api/v1',
                auth: '/api/v1/auth',
                courses: '/api/v1/courses',
                users: '/api/v1/users',
            },
        };
    });

    // ==================== REQUEST LOGGING ====================
    fastify.addHook('onResponse', (request, reply) => {
        const log = {
            method: request.method,
            url: request.url,
            status: reply.statusCode,
            responseTime: reply.elapsedTime,
            requestId: request.id,
        };
        if (reply.statusCode >= 400) {
            fastify.log.error(log);
        } else {
            fastify.log.info(log);
        }
    });

    return fastify;
}