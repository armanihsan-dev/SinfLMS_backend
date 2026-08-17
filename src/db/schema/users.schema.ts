// src/db/schema/users.schema.ts
import {
    pgTable,
    uuid,
    varchar,
    text,
    boolean,
    timestamp,
    jsonb,
    index, integer,
    inet
} from 'drizzle-orm/pg-core';


export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).unique().notNull(),
    passwordHash: varchar('password_hash', { length: 255 }).default('oauth_google_placeholder'),
    fullName: varchar('full_name', { length: 255 }).notNull(),
    username: varchar('username', { length: 50 }).unique(),
    avatarUrl: text('avatar_url'),
    bio: text('bio'),
    role: varchar('role', { length: 20 }).notNull().default('student'),


    // OAuth fields
    googleId: varchar('google_id', { length: 255 }).unique(),
    githubId: varchar('github_id', { length: 255 }).unique(),
    isOAuthUser: boolean('is_oauth_user').default(false),

    //security
    isLocked: boolean('is_locked').default(false),
    lockedUntil: timestamp('locked_until', { withTimezone: true }),
    loginAttempts: integer('login_attempts').default(0),



    // Verification
    isVerified: boolean('is_verified').default(false),
    isActive: boolean('is_active').default(true),

    // Session Trackings
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
    lastLoginIp: inet('last_login_ip'),
    currentSessionId: uuid('current_session_id'),

    // Additional
    expertise: text('expertise').array().default([]),
    socialLinks: jsonb('social_links').default({}),
    preferences: jsonb('preferences').default({}),


    //timeStamp
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),

}, (table) => ({
    // Define indexes for better performance
    emailIdx: index('idx_users_email').on(table.email),
    usernameIdx: index('idx_users_username').on(table.username),
    roleIdx: index('idx_users_role').on(table.role),
    activeIdx: index('idx_users_active').on(table.isActive),
    lockedIdx: index('idx_users_locked').on(table.isLocked),
    googleIdx: index('idx_users_google').on(table.googleId),
    githubIdx: index('idx_users_github').on(table.githubId),
}));

// Type exports for use in queries
export type User = typeof users.$inferSelect;    // Type for SELECT queries
export type NewUser = typeof users.$inferInsert;  // Type for INSERT queries

