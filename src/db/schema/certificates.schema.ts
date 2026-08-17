// src/db/schema/certificates.schema.ts
import { pgTable, uuid, varchar, text, boolean, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { users } from './users.schema.js';
import { courses } from './courses.schema.js';



export const certificates = pgTable('certificates', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  courseId: uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  certificateNumber: varchar('certificate_number', { length: 100 }).unique().notNull(),
  issuedAt: timestamp('issued_at', { withTimezone: true }).defaultNow(),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  isVerified: boolean('is_verified').default(true),
  verificationUrl: text('verification_url'),
  metadata: jsonb('metadata').default({}),
}, (table) => ({
  userIdx: index('idx_certificates_user').on(table.userId),
  courseIdx: index('idx_certificates_course').on(table.courseId),
  numberIdx: index('idx_certificates_number').on(table.certificateNumber),
}));

export type Certificate = typeof certificates.$inferSelect;
export type NewCertificate = typeof certificates.$inferInsert;