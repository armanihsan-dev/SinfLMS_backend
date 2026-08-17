// src/db/schema/categories.schema.ts
import { relations } from 'drizzle-orm';
import { pgTable, uuid, varchar, text, integer, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { courses } from './courses.schema.js';

export const categories = pgTable('categories', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).notNull(),
    slug: varchar('slug', { length: 100 }).unique().notNull(),
    description: text('description'),
    parentId: uuid('parent_id'),
    iconUrl: text('icon_url'),
    orderPosition: integer('order_position').default(0),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
    parentIdx: index('idx_categories_parent').on(table.parentId),
    slugIdx: index('idx_categories_slug').on(table.slug),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
    parent: one(categories, {
        fields: [categories.parentId],
        references: [categories.id],
    }),
    children: many(categories),
    courses: many(courses),
}))

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;