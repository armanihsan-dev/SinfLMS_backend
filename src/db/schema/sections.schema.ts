// src/db/schema/sections.schema.ts
import { pgTable, uuid, varchar, text, integer, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { courses } from './courses.schema.js';


export const sections = pgTable('sections', {
  id: uuid('id').primaryKey().defaultRandom(),
  courseId: uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  orderPosition: integer('order_position').notNull(),
  isPreview: boolean('is_preview').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  courseIdx: index('idx_sections_course').on(table.courseId, table.orderPosition),
}));

export type Section = typeof sections.$inferSelect;
export type NewSection = typeof sections.$inferInsert;