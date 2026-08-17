// src/db/schema/lesson-progress.schema.ts
import { pgTable, uuid, boolean, integer, timestamp, unique, index } from 'drizzle-orm/pg-core';
import { enrollments } from './enrollments.schema.js';
import { lessons } from './lessons.schema.js';


export const lessonProgress = pgTable('lesson_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  enrollmentId: uuid('enrollment_id').notNull().references(() => enrollments.id, { onDelete: 'cascade' }),
  lessonId: uuid('lesson_id').notNull().references(() => lessons.id, { onDelete: 'cascade' }),
  isCompleted: boolean('is_completed').default(false),
  lastPosition: integer('last_position').default(0), // seconds for video
  startedAt: timestamp('started_at', { withTimezone: true }).defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  timeSpent: integer('time_spent').default(0), // seconds
  attempts: integer('attempts').default(0),
}, (table) => ({
  // One enrollment + one lesson = one progress record
  uniqueProgress: unique().on(table.enrollmentId, table.lessonId),
  enrollmentIdx: index('idx_progress_enrollment').on(table.enrollmentId),
  completionIdx: index('idx_progress_completed').on(table.isCompleted),
}));

export type LessonProgress = typeof lessonProgress.$inferSelect;
export type NewLessonProgress = typeof lessonProgress.$inferInsert;