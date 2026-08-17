// src/db/schema/courses.schema.ts
import {
  pgTable,
  uuid,
  varchar,
  text,
  decimal,
  boolean,
  timestamp,
  integer,
  index
} from 'drizzle-orm/pg-core';
import { users } from './users.schema.js';
import { categories } from './categories.schema.js';



export const courses = pgTable('courses', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).unique().notNull(),
  subtitle: varchar('subtitle', { length: 500 }),
  description: text('description'),
  longDescription: text('long_description'),
  instructorId: uuid('instructor_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
  language: varchar('language', { length: 10 }).default('en'),
  level: varchar('level', { length: 20 }).notNull(), // beginner, intermediate, advanced
  price: decimal('price', { precision: 10, scale: 2 }).default('0'),
  discountPrice: decimal('discount_price', { precision: 10, scale: 2 }),
  currency: varchar('currency', { length: 3 }).default('USD'),
  thumbnailUrl: text('thumbnail_url'),
  promoVideoUrl: text('promo_video_url'),
  whatYouLearn: text('what_you_learn').array().default([]),
  requirements: text('requirements').array().default([]),
  targetAudience: text('target_audience').array().default([]),
  isPublished: boolean('is_published').default(false),
  isFeatured: boolean('is_featured').default(false),
  approvalStatus: varchar('approval_status', { length: 20 }).default('pending'),
  totalStudents: integer('total_students').default(0),
  averageRating: decimal('average_rating', { precision: 3, scale: 2 }).default('0'),
  totalReviews: integer('total_reviews').default(0),
  totalDuration: integer('total_duration').default(0), // minutes
  totalLessons: integer('total_lessons').default(0),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => ({
  // Indexes for common queries
  slugIdx: index('idx_courses_slug').on(table.slug),
  instructorIdx: index('idx_courses_instructor').on(table.instructorId),
  categoryIdx: index('idx_courses_category').on(table.categoryId),
  publishedIdx: index('idx_courses_published').on(table.isPublished, table.publishedAt),
  ratingIdx: index('idx_courses_rating').on(table.averageRating.desc()),
  createdIdx: index('idx_courses_created').on(table.createdAt.desc()),
}));

export type Course = typeof courses.$inferSelect;
export type NewCourse = typeof courses.$inferInsert;