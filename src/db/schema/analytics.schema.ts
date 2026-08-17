// src/db/schema/analytics.schema.ts
import { pgTable, uuid, text, timestamp, integer, boolean, inet, index } from 'drizzle-orm/pg-core';
import { courses } from './courses.schema.js';
import { users } from './users.schema.js';


export const courseViews = pgTable('course_views', {
  id: uuid('id').primaryKey().defaultRandom(),
  courseId: uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  sessionId: text('session_id'),
  ipAddress: inet('ip_address'),
  userAgent: text('user_agent'), // mozzlie brower,app etc
  referrer: text('referrer'), // where they came from google, twitter etc
  viewedAt: timestamp('viewed_at', { withTimezone: true }).defaultNow(),
  duration: integer('duration').default(0),
  isUnique: boolean('is_unique').default(true),
}, (table) => ({
  courseIdx: index('idx_views_course').on(table.courseId, table.viewedAt.desc()),
  userIdx: index('idx_views_user').on(table.userId),
  sessionIdx: index('idx_views_session').on(table.sessionId),
}));

export type CourseView = typeof courseViews.$inferSelect;
export type NewCourseView = typeof courseViews.$inferInsert;