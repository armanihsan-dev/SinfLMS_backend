// src/types/fastify.d.ts
import { Redis } from 'ioredis';

// Define session type
export interface SessionData {
    userId: string;
    createdAt: string;
    expiresAt: string;
    lastActivityAt: string;
    userAgent?: string;
    ipAddress?: string;
    deviceInfo?: any;
}

declare module 'fastify' {
    interface FastifyInstance {
        redis: Redis;
    }

    interface FastifyRequest {
        session: SessionData | null;
        userId: string | null;
        user: User | null;          
        sessionId: string | null;
        sessionToken: string | null;
    }
}

// Extend cookie plugin types if needed
declare module '@fastify/cookie' {
    interface FastifyCookieOptions {
        secret?: string;
        parseOptions?: {
            httpOnly?: boolean;
            secure?: boolean;
            sameSite?: 'lax' | 'strict' | 'none';
            path?: string;
            domain?: string;
            maxAge?: number;
        };
    }
}