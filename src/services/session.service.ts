// src/services/session.service.ts
import { redis } from '../config/redis.js';
import { randomBytes } from 'crypto';

export class SessionService {
    private readonly sessionPrefix = 'session:';
    private readonly userSessionsPrefix = 'user_sessions:';
    private readonly userSessionsSortedKey = 'user_sessions_sorted:';
    private readonly MAX_SESSIONS = 3;

    async createSession(userId: string, data: any) {
        const userSessionsKey = `${this.userSessionsPrefix}${userId}`;
        const userSessionsSortedKey = `${this.userSessionsSortedKey}${userId}`;

        // Get current count
        const currentCount = await redis.scard(userSessionsKey);

        // If at max, remove oldest using sorted set
        if (currentCount >= this.MAX_SESSIONS) {
            // ✅ FIX: Use zrange + zrem instead of zpopmin
            await this.removeOldestSession(userId);
        }

        // Create new session
        const sessionToken = randomBytes(32).toString('hex');
        const sessionId = `${this.sessionPrefix}${sessionToken}`;
        const timestamp = Date.now();

        const sessionData = {
            id: sessionToken,
            userId,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            lastActivityAt: new Date().toISOString(),
            userAgent: data.userAgent,
            ipAddress: data.ip,
            deviceInfo: data.deviceInfo || {},
        };

        // Store session data
        await redis.setex(
            sessionId,
            7 * 24 * 60 * 60,
            JSON.stringify(sessionData)
        );

        // Add to user's session list (Set)
        await redis.sadd(userSessionsKey, sessionToken);
        await redis.expire(userSessionsKey, 7 * 24 * 60 * 60);

        // Add to sorted set (key = timestamp, value = token)
        await redis.zadd(userSessionsSortedKey, timestamp, sessionToken);
        await redis.expire(userSessionsSortedKey, 7 * 24 * 60 * 60);

        return { sessionToken, ...sessionData };
    }

    private async removeOldestSession(userId: string) {
        const userSessionsSortedKey = `${this.userSessionsSortedKey}${userId}`;

        // ✅ Get the oldest session (first item in sorted set)
        const oldestTokens = await redis.zrange(
            userSessionsSortedKey,
            "0",  // Start index
            '0',  // End index (only get 1)
            'WITHSCORES'
        );

        if (oldestTokens && oldestTokens.length > 0) {
            const oldestToken = oldestTokens[0]; // First item is the token

            // ✅ Delete the session
            await this.revokeSession(oldestToken);

            // ✅ Remove from sorted set
            await redis.zrem(userSessionsSortedKey, oldestToken);
        }
    }

    async validateSession(sessionToken: string) {
        const sessionId = `${this.sessionPrefix}${sessionToken}`;
        const data = await redis.get(sessionId);

        if (!data) return null;

        const session = JSON.parse(data);

        // Check expiry
        if (new Date(session.expiresAt) < new Date()) {
            await this.revokeSession(sessionToken);
            return null;
        }

        // Refresh TTL on activity
        await redis.expire(sessionId, 7 * 24 * 60 * 60);
        session.lastActivityAt = new Date().toISOString();
        await redis.setex(sessionId, 7 * 24 * 60 * 60, JSON.stringify(session));

        return session;
    }

    async revokeSession(sessionToken: string) {
        
        const sessionId = `${this.sessionPrefix}${sessionToken}`;
        const data = await redis.get(sessionId);

        if (data) {
            const session = JSON.parse(data);
            await redis.del(sessionId);
            await redis.srem(`${this.userSessionsPrefix}${session.userId}`, sessionToken);
        }
    }

    async revokeAllUserSessions(userId: string) {
        const key = `${this.userSessionsPrefix}${userId}`;
        const sessions = await redis.smembers(key);

        for (const token of sessions) {
            await redis.del(`${this.sessionPrefix}${token}`);
        }

        await redis.del(key);
    }

    async getUserSessions(userId: string) {
        const key = `${this.userSessionsPrefix}${userId}`;
        const tokens = await redis.smembers(key);
        const sessions = [];

        for (const token of tokens) {
            const data = await redis.get(`${this.sessionPrefix}${token}`);
            if (data) {
                sessions.push(JSON.parse(data));
            }
        }

        return sessions;
    }

    async cleanupExpiredSessions() {
        // Redis handles TTL automatically
        // Just remove expired from user session sets
        const keys = await redis.keys(`${this.userSessionsPrefix}*`);

        for (const key of keys) {
            const userId = key.replace(this.userSessionsPrefix, '');
            const sessions = await redis.smembers(key);

            for (const token of sessions) {
                const exists = await redis.exists(`${this.sessionPrefix}${token}`);

                if (!exists) {
                    await redis.srem(key, token);
                }
            }
        }
    }
}

export const sessionService = new SessionService();