// src/db/schema/lessons.schema.ts
import { pgTable, uuid, varchar, text, integer, boolean, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { sections } from './sections.schema.js';



export const lessons = pgTable('lessons', {
  id: uuid('id').primaryKey().defaultRandom(),
  sectionId: uuid('section_id').notNull().references(() => sections.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  lessonType: varchar('lesson_type', { length: 20 }).notNull(),
  orderPosition: integer('order_position').notNull(),
  isFreePreview: boolean('is_free_preview').default(false),
  isDraft: boolean('is_draft').default(true),
  duration: integer('duration').default(0), // minutes
  
  // Flexible content storage
  content: jsonb('content').default({}),
  
  // Video specific
  videoUrl: text('video_url'),
  videoDuration: integer('video_duration'),
  videoQuality: jsonb('video_quality').default({}),
  
  // Attachments
  attachments: jsonb('attachments').default([]),
  
  // Quiz specific
  quizSettings: jsonb('quiz_settings').default({}),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  sectionIdx: index('idx_lessons_section').on(table.sectionId, table.orderPosition),
  typeIdx: index('idx_lessons_type').on(table.lessonType),
}));

export type Lesson = typeof lessons.$inferSelect;
export type NewLesson = typeof lessons.$inferInsert;