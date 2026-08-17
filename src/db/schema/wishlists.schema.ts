// src/db/schema/wishlists.schema.ts
import { pgTable, uuid, timestamp, unique, index } from 'drizzle-orm/pg-core';
import { users } from './users.schema.js';
import { courses } from './courses.schema.js';


export const wishlists = pgTable('wishlists', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  courseId: uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  addedAt: timestamp('added_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  uniqueWishlist: unique().on(table.userId, table.courseId),
  userIdx: index('idx_wishlists_user').on(table.userId),
  courseIdx: index('idx_wishlists_course').on(table.courseId),
}));

export type Wishlist = typeof wishlists.$inferSelect;
export type NewWishlist = typeof wishlists.$inferInsert;