// src/webhooks/handlers/subscription.handler.ts
import { eq } from 'drizzle-orm';
import { db } from '../../config/database.js';
import { users } from '../../db/schema/users.schema.js';
import { subscriptionService } from '../../services/subscription.service.js';
import { Errors } from '../../utils/handle-request.js';
import { logger } from '../../utils/logger.js';

/**
 * Handles instructor subscription webhook events
 */
export async function handleInstructorSubscription(eventData: any) {
    const { attributes, relationships } = eventData;

    const subscriptionId = eventData.id;
    const status = attributes.status;
    const plan = attributes.variant_name || 'monthly';
    const startsAt = new Date(attributes.starts_at);
    const expiresAt = new Date(attributes.expires_at);

    // Get customer email
    const customerEmail = relationships?.customer?.data?.email;

    if (!customerEmail) {
        throw Errors.badRequest('Customer email not found');
    }

    // Find user by email
    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, customerEmail))
        .limit(1);

    if (!user) {
        throw Errors.notFound('User not found');
    }

    // Save subscription record
    await subscriptionService.saveSubscriptionRecord({
        userId: user.id,
        subscriptionId,
        plan: plan.toLowerCase().includes('yearly') ? 'yearly' : 'monthly',
        status,
        startsAt,
        expiresAt,
    });

    // If subscription is active, upgrade user to instructor
    if (status === 'active' || status === 'paid') {
        await subscriptionService.upgradeToInstructor(user.id, subscriptionId);
        logger.info(`User ${user.id} upgraded to instructor`);
    } else if (status === 'canceled' || status === 'expired') {
        await subscriptionService.downgradeFromInstructor(user.id);
        logger.info(`User ${user.id} downgraded from instructor`);
    }

    return { success: true };
}