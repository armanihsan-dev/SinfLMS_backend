// src/db/schema/tags.schema.ts
import { pgTable, uuid, varchar, timestamp, index, primaryKey } from 'drizzle-orm/pg-core';
import { courses } from './courses.schema.js';



export const tags = pgTable('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 50 }).unique().notNull(),
  slug: varchar('slug', { length: 50 }).unique().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  slugIdx: index('idx_tags_slug').on(table.slug),
}));



export const courseTags = pgTable('course_tags', {
  courseId: uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  tagId: uuid('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: primaryKey({ columns: [table.courseId, table.tagId] }),
}));

export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;