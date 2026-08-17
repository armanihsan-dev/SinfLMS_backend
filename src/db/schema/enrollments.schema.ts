// src/db/schema/enrollments.schema.ts
import { pgTable, uuid, decimal, integer, boolean, timestamp, text, unique, index } from 'drizzle-orm/pg-core';
import { users } from './users.schema.js';
import { courses } from './courses.schema.js';




export const enrollments = pgTable('enrollments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  courseId: uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  enrolledAt: timestamp('enrolled_at', { withTimezone: true }).defaultNow(),
  enrolledPrice: decimal('enrolled_price', { precision: 10, scale: 2 }),
  progressPercentage: integer('progress_percentage').default(0),
  lastAccessedAt: timestamp('last_accessed_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  certificateUrl: text('certificate_url'),
  isArchived: boolean('is_archived').default(false),
}, (table) => ({
  // One user + one course = one enrollment
  uniqueEnrollment: unique().on(table.userId, table.courseId),
  userIdx: index('idx_enrollments_user').on(table.userId),
  courseIdx: index('idx_enrollments_course').on(table.courseId),
  progressIdx: index('idx_enrollments_progress').on(table.progressPercentage),
}));

export type Enrollment = typeof enrollments.$inferSelect;
export type NewEnrollment = typeof enrollments.$inferInsert;