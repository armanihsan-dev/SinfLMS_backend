// src/db/schema/instructors.schema.ts
import {
    pgTable,
    uuid,
    varchar,
    text,
    decimal,
    boolean,
    timestamp,
    integer,
    jsonb,
    index,
} from 'drizzle-orm/pg-core';
import { users } from './users.schema.js';

export const instructors = pgTable('instructors', {
    id: uuid('id').primaryKey().defaultRandom(),

    // Relationship to users
    userId: uuid('user_id')
        .notNull()
        .unique()
        .references(() => users.id, { onDelete: 'cascade' }),

    // Instructor profile
    bio: text('bio'),
    expertise: text('expertise').array().default([]),
    website: varchar('website', { length: 255 }),
    socialLinks: jsonb('social_links').default({}),
    // socialLinks: { twitter: '', linkedin: '', youtube: '', github: '' }

    // Stats
    totalStudents: integer('total_students').default(0),
    totalCourses: integer('total_courses').default(0),
    totalRevenue: decimal('total_revenue', { precision: 10, scale: 2 }).default('0'),
    rating: decimal('rating', { precision: 3, scale: 2 }).default('0'),
    totalReviews: integer('total_reviews').default(0),

    // Subscription status
    isSubscribed: boolean('is_subscribed').default(false),
    subscriptionId: varchar('subscription_id', { length: 255 }),
    subscriptionPlan: varchar('subscription_plan', { length: 20 }), // 'monthly', 'yearly'
    subscriptionExpiresAt: timestamp('subscription_expires_at', { withTimezone: true }),
    subscribedAt: timestamp('subscribed_at', { withTimezone: true }),

    // Verification
    isVerified: boolean('is_verified').default(false),
    verifiedAt: timestamp('verified_at', { withTimezone: true }),

    // Lemon Squeezy
    lemonSqueezyStoreId: varchar('lemon_squeezy_store_id', { length: 255 }),
    lemonSqueezyProductId: varchar('lemon_squeezy_product_id', { length: 255 }),

    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),

}, (table) => ({
    userIdIdx: index('idx_instructors_user_id').on(table.userId),
    subscribedIdx: index('idx_instructors_subscribed').on(table.isSubscribed),
    ratingIdx: index('idx_instructors_rating').on(table.rating.desc()),
}));

export type Instructor = typeof instructors.$inferSelect;
export type NewInstructor = typeof instructors.$inferInsert;