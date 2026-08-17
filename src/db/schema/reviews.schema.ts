// src/db/schema/reviews.schema.ts
import { pgTable, uuid, text, integer, boolean, timestamp, unique, index } from 'drizzle-orm/pg-core';
import { users } from './users.schema.js';
import { courses } from './courses.schema.js';


export const reviews = pgTable('reviews', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    courseId: uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
    rating: integer('rating').notNull(),
    reviewText: text('review_text'),
    isVerifiedPurchase: boolean('is_verified_purchase').default(true),
    isApproved: boolean('is_approved').default(true),
    helpfulCount: integer('helpful_count').default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
    // One user can review a course only once
    uniqueReview: unique().on(table.userId, table.courseId),
    courseIdx: index('idx_reviews_course').on(table.courseId, table.rating.desc()),
    userIdx: index('idx_reviews_user').on(table.userId),
}));

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;

