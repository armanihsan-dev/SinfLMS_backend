// src/services/subscription.service.ts
import { db } from '../config/database.js';
import { users } from '../db/schema/users.schema.js';
import { instructors } from '../db/schema/instructors.schema.js';
import { subscriptions } from '../db/schema/subscriptions.schema.js';
import { eq } from 'drizzle-orm';
import { Errors } from '../utils/handle-request.js';
import { lemonSqueezyService } from './LemonSqueezy.service.js';

export class SubscriptionService {
    /**
     * Create checkout session
     */
    async createCheckout(data: {
        userId: string;
        plan: 'monthly' | 'yearly';
        customerEmail: string;
        customerName?: string;
        redirectUrl?: string;
        customData: Record<string, any>;
        variantId: string;
    }) {
        const checkout = await lemonSqueezyService.createCheckout({
            variantId: data.variantId,
            customerEmail: data.customerEmail,
            customerName: data.customerName,
            redirectUrl: data.redirectUrl || `${process.env.FRONTEND_URL}/dashboard`,
            customData: data.customData,
        });

        return {
            checkoutUrl: checkout.checkoutUrl,
            checkoutId: checkout.checkoutId,
        };
    }

    /**
     * Upgrade user to instructor
     */
    async upgradeToInstructor(userId: string, subscriptionId: string) {
        await db.update(users)
            .set({
                role: 'instructor',
                updatedAt: new Date(),
            })
            .where(eq(users.id, userId));

        const [existingInstructor] = await db
            .select()
            .from(instructors)
            .where(eq(instructors.userId, userId))
            .limit(1);

        if (existingInstructor) {
            await db.update(instructors)
                .set({
                    isSubscribed: true,
                    subscriptionId: subscriptionId,
                    subscribedAt: new Date(),
                    updatedAt: new Date(),
                })
                .where(eq(instructors.userId, userId));
        } else {
            await db.insert(instructors).values({
                userId: userId,
                isSubscribed: true,
                subscriptionId: subscriptionId,
                subscribedAt: new Date(),
                isVerified: false,
            });
        }
    }

    /**
     * Downgrade instructor to student
     */
    async downgradeFromInstructor(userId: string) {
        await db.update(users)
            .set({
                role: 'student',
                updatedAt: new Date(),
            })
            .where(eq(users.id, userId));

        await db.update(instructors)
            .set({
                isSubscribed: false,
                updatedAt: new Date(),
            })
            .where(eq(instructors.userId, userId));
    }

    /**
     * Check if user is an active instructor
     */
    async isActiveInstructor(userId: string): Promise<boolean> {
        const [instructor] = await db
            .select()
            .from(instructors)
            .where(eq(instructors.userId, userId))
            .limit(1);

        if (!instructor) return false;
        return instructor.isSubscribed === true;
    }

    /**
     * Get instructor status
     */
    async getInstructorStatus(userId: string) {
        const [instructor] = await db
            .select()
            .from(instructors)
            .where(eq(instructors.userId, userId))
            .limit(1);

        const [user] = await db
            .select({ role: users.role })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        return {
            isInstructor: user?.role === 'instructor',
            isSubscribed: instructor?.isSubscribed || false,
            subscriptionExpiresAt: instructor?.subscriptionExpiresAt,
            isVerified: instructor?.isVerified || false,
            profile: instructor || null,
        };
    }

    /**
     * Cancel subscription
     */
    async cancelSubscription(userId: string) {
        const [instructor] = await db
            .select()
            .from(instructors)
            .where(eq(instructors.userId, userId))
            .limit(1);

        if (!instructor?.subscriptionId) {
            throw Errors.notFound('No active subscription found');
        }

        await lemonSqueezyService.cancelSubscription(instructor.subscriptionId);

        return { success: true };
    }

    /**
     * Save subscription record (used by webhook handler)
     */
    async saveSubscriptionRecord(data: {
        userId: string;
        subscriptionId: string;
        plan: string;
        status: string;
        startsAt: Date;
        expiresAt: Date;
    }) {
        await db.insert(subscriptions).values({
            userId: data.userId,
            lemonSqueezySubscriptionId: data.subscriptionId,
            plan: data.plan,
            status: data.status,
            startsAt: data.startsAt,
            expiresAt: data.expiresAt,
            updatedAt: new Date(),
        }).onConflictDoUpdate({
            target: subscriptions.lemonSqueezySubscriptionId,
            set: {
                status: data.status,
                expiresAt: data.expiresAt,
                updatedAt: new Date(),
            },
        });
    }
}

export const subscriptionService = new SubscriptionService();