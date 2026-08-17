// src/controllers/auth.controller.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { loginSchema, registerSchema } from '../db/schemas/auth.schema.js';
import { db } from '../config/database.js';
import { users } from '../db/schema/users.schema.js';
import { eq } from 'drizzle-orm';
import { Errors } from '../utils/handle-request.js';
import bcrypt from 'bcrypt';
import { sessionService } from '../services/session.service.js';
import { googleService } from '../services/google.service.js';
import { randomBytes } from 'node:crypto';
import { githubService } from '../services/github.service.js';
import axios from 'axios';

export class AuthController {
    async githubLogin(request: FastifyRequest, reply: FastifyReply) {
        const { code } = request.body as { code: string };

        // 1. Exchange code for access token
        const tokenResponse = await axios.post(
            'https://github.com/login/oauth/access_token',
            {
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code: code,

            },
            { headers: { Accept: 'application/json' } }
        );

        const { access_token } = tokenResponse.data;

        if (!access_token) {
            throw Errors.unauthorized('Failed to get access token from GitHub');
        }

        // 2. Get user info
        const githubUser = await githubService.verifyToken(access_token);

        // 3. Find or create user
        let [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, githubUser.email))
            .limit(1);

        if (!user) {
            const username = githubUser.username || githubUser.email.split('@')[0];
            const [newUser] = await db
                .insert(users)
                .values({
                    email: githubUser.email,
                    fullName: githubUser.fullName || githubUser.username,
                    username: username,
                    avatarUrl: githubUser.avatarUrl ?? null,
                    githubId: githubUser.githubId,
                    isOAuthUser: true,
                    isVerified: githubUser.verified || true,
                    isActive: true,
                    passwordHash: 'oauth_github_placeholder',
                })
                .returning();
            user = newUser;
        } else if (!user.githubId) {
            await db
                .update(users)
                .set({
                    githubId: githubUser.githubId,
                    isOAuthUser: true,
                    avatarUrl: githubUser.avatarUrl || user.avatarUrl,
                    isVerified: githubUser.verified || true,
                })
                .where(eq(users.id, user.id));
        }

        // 4. Create session
        const session = await sessionService.createSession(user.id, {
            userAgent: request.headers['user-agent'],
            ipAddress: request.ip,
            rememberMe: true,
        });

        // 5. Update last login
        await db
            .update(users)
            .set({
                lastLoginAt: new Date(),
                lastLoginIp: request.ip,
            })
            .where(eq(users.id, user.id));

        // 6. Set cookie
        reply.setCookie('sessionId', session.sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60,
            path: '/',
        });

        // 7. Return user (for POST /github) or redirect (for GET /github/callback)
        return {
            message: 'GitHub login successful',
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                username: user.username,
                role: user.role,
                avatarUrl: user.avatarUrl,
                isVerified: user.isVerified,
                isNewUser: !user.githubId,
            },
        };
    }

    async register(request: FastifyRequest, reply: FastifyReply) {
        const validatedData = registerSchema.parse(request.body);

        const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.email, validatedData.email))
            .limit(1);

        if (existingUser.length > 0) {
            throw Errors.conflict('User already exists with this email');
        }

        if (validatedData.username) {
            const existingUsername = await db.select().from(users).where(eq(users.username, validatedData.username))
            if (existingUsername.length > 0) {
                throw Errors.conflict('Username already taken');
            }
        }
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(validatedData.password, saltRounds);
        const [newUser] = await db
            .insert(users)
            .values({
                email: validatedData.email,
                passwordHash: passwordHash,
                fullName: validatedData.fullName,
                username: validatedData.username || null,
                role: 'student',
                isActive: true,
                isVerified: false,
            })
            .returning({
                id: users.id,
                email: users.email,
                fullName: users.fullName,
                username: users.username,
                role: users.role,
                createdAt: users.createdAt,
            });
        const session = await sessionService.createSession(newUser.id, {
            userAgent: request.headers['user-agent'],
            ipAddress: request.ip,
            rememberMe: validatedData.rememberMe,
        });

        reply.setCookie('sessionId', session.sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: validatedData.rememberMe ? 14 * 24 * 60 * 60 : 7 * 24 * 60 * 60,
            path: '/',
        });

        return {
            message: 'User registered successfully',
            user: {
                id: newUser.id,
                email: newUser.email,
                fullName: newUser.fullName,
                username: newUser.username,
                role: newUser.role,
            },
        };
    }

    async login(request: FastifyRequest, reply: FastifyReply) {
        const validatedData = loginSchema.parse(request.body);

        console.log(validatedData);

        //  Find user
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, validatedData.email))
            .limit(1);

        if (!user) {
            throw Errors.unauthorized('Invalid credentials');
        }

        //  Check if account is locked  
        if (user.isLocked) {
            // Check if lock has expired
            if (user.lockedUntil && new Date() > user.lockedUntil) {
                // Auto-unlock
                await db.update(users)
                    .set({
                        isLocked: false,
                        lockedUntil: null,
                        loginAttempts: 0,
                    })
                    .where(eq(users.id, user.id));
            } else {
                throw Errors.unauthorized('Account is locked. Please try again later.');
            }
        }

        // 3. Check if account is active
        if (!user.isActive) {
            throw Errors.unauthorized('Account is deactivated');
        }

        // 4. Verify password
        const isValidPassword = await bcrypt.compare(
            validatedData.password,
            user.passwordHash!
        );

        if (!isValidPassword) {
            // Increment failed attempts
            const attempts = (user.loginAttempts || 0) + 1;
            const isLocked = attempts >= 5;

            await db.update(users)
                .set({
                    loginAttempts: attempts,
                    isLocked: isLocked,
                    lockedUntil: isLocked ? new Date(Date.now() + 30 * 60 * 1000) : null,
                })
                .where(eq(users.id, user.id));

            throw Errors.unauthorized('Invalid credentials');
        }

        // 5. Reset login attempts on success
        const session = await sessionService.createSession(user.id, {
            userAgent: request.headers['user-agent'],
            ipAddress: request.ip,
            rememberMe: validatedData.rememberMe,
        });

        await db.update(users)
            .set({
                loginAttempts: 0,
                isLocked: false,
                lockedUntil: null,
                lastLoginAt: new Date(),
                lastLoginIp: request.ip,
                currentSessionId: session.ipAddress,
            })
            .where(eq(users.id, user.id));

        // Set cookie
        reply.setCookie('sessionId', session.sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: validatedData.rememberMe ? 14 * 24 * 60 * 60 : 7 * 24 * 60 * 60,
            path: '/',
        });

        return {
            message: 'Login successful',
            userr: user,
            user: {
                id: user.id || null,
                email: user.email || null,
                fullName: user.fullName || null,
                username: user.username || null,
                role: user.role || null,
                avatarUrl: user.avatarUrl || null,
                bio: user.bio || null,
                isVerified: user.isVerified || false,
            },
        };
    }

    async googleLogin(request: FastifyRequest, reply: FastifyReply) {
        const { token } = request.body as { token: string };

        // 1. Verify Google token
        const googleUser = await googleService.verifyToken(token);

        console.log("GOOGLE USER", googleUser);
        // 2. Find or create user
        let [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, googleUser.email as string))
            .limit(1);

        if (!user) {
            // Create new user
            const username = googleUser.email!.split('@')[0] +
                randomBytes(4).toString('hex');
            console.log("USER NAME :", username);
            const [newUser] = await db
                .insert(users)
                .values({
                    email: googleUser.email as string,
                    fullName: googleUser.fullName ?? 'User',
                    username: username,
                    avatarUrl: googleUser.avatarUrl ?? null,
                    googleId: googleUser.googleId ?? null,
                    isOAuthUser: true,
                    isVerified: googleUser.isVerified || true,
                    isActive: true,
                    passwordHash: 'oauth_google_placeholder'
                })
                .returning();

            user = newUser;
        } else if (!user.googleId) {
            // Link Google account to existing user
            await db
                .update(users)
                .set({
                    googleId: googleUser.googleId,
                    isOAuthUser: true,
                    avatarUrl: googleUser.avatarUrl || user.avatarUrl,
                    isVerified: googleUser.isVerified || true,
                })
                .where(eq(users.id, user.id));
        }
        // 3. Create session
        const session = await sessionService.createSession(user.id, {
            userAgent: request.headers['user-agent'],
            ipAddress: request.ip,
            rememberMe: true,
        });

        // 4. Update last login
        await db
            .update(users)
            .set({
                lastLoginAt: new Date(),
                lastLoginIp: request.ip,
            })
            .where(eq(users.id, user.id));

        // 5. Set cookie
        reply.setCookie('sessionId', session.sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60,
            path: '/',
        });

        return {
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                username: user.username,
                role: user.role,
                avatarUrl: user.avatarUrl,
                isVerified: user.isVerified,
                isNewUser: !user.googleId,
            },
        };
    }

    async me(request: FastifyRequest, reply: FastifyReply) {
        // Get user from request (set by auth middleware)
        const user = request.user;

        console.log("USER in me controller :", user);
        if (!user) {
            throw Errors.unauthorized('Not authenticated');
        }
        // Return WITHOUT fetching again!
        return {
            message: 'User retrieved successfully',
            user: user,
        };
    }

    async logout(request: FastifyRequest, reply: FastifyReply) {
        // Get session from request (set by auth middleware)
        const session = request.session;
        console.log("SESSION IN LOGOUT CONTROLLER :", session);

        if (session) {
            await sessionService.revokeSession(request.sessionToken!);
        }

        // Clear cookie
        reply.clearCookie('sessionId', {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        });

        // Optionally clear user's currentSessionId in DB
        if (session?.userId) {
            await db
                .update(users)
                .set({
                    currentSessionId: null,
                })
                .where(eq(users.id, session.userId));
        }

        return {
            message: 'Logged out successfully',
        };
    }
}