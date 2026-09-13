
// src/db/schema/subscriptions.ts
import {
    pgTable,
    uuid,
    varchar,
    timestamp,
    decimal
} from 'drizzle-orm/pg-core';
import { users } from './users.schema.js';




export const subscriptions = pgTable('subscriptions', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id).notNull(),

    // Lemon Squeezy
    lemonSqueezySubscriptionId: varchar('lemon_squeezy_subscription_id').unique(),
    lemonSqueezyOrderId: varchar('lemon_squeezy_order_id'),

    plan: varchar('plan', { length: 20 }).notNull(), // 'monthly', 'yearly'
    status: varchar('status', { length: 20 }).default('active'),
    // 'active', 'canceled', 'expired', 'past_due'

    amount: decimal('amount', { precision: 10, scale: 2 }),
    currency: varchar('currency', { length: 3 }).default('USD'),

    startsAt: timestamp('starts_at'),
    expiresAt: timestamp('expires_at'),
    canceledAt: timestamp('canceled_at'),

    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});