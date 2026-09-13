// src/modules/subscription/subscription.controller.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { subscriptionService } from '../services/subscription.service.js';
import { Errors } from '../utils/handle-request.js';
import { lemonSqueezyService } from '../services/LemonSqueezy.service.js';

export class SubscriptionController {
    /**
     * Create checkout for subscription
     */
    async createCheckout(request: FastifyRequest, reply: FastifyReply) {
        const user = request.user;

        if (!user) {
            throw Errors.unauthorized('Not authenticated');
        }

        // Explicitly type the body with 'purpose'
        const { plan, redirectUrl, purpose, courseId } = request.body as {
            plan?: 'monthly' | 'yearly';
            redirectUrl?: string;
            purpose: 'instructor_subscription' | 'course_purchase' | 'certificate_purchase';
            courseId?: string;  
        };

        // Build custom data based on purpose
        const customData: any = {
            purpose,
            userId: user.id,
            userEmail: user.email,
        };

        let variantId: string;

        switch (purpose) {
            case 'instructor_subscription':
                if (!plan) {
                    throw Errors.badRequest('Plan is required for instructor subscription');
                }
                variantId = lemonSqueezyService.getVariantId(plan);
                customData.plan = plan;
                break;

            case 'certificate_purchase':
                variantId = process.env.LEMON_SQUEEZY_CERTIFICATE_VARIANT_ID!;
                if (!variantId) {
                    throw Errors.internal('Certificate variant not configured');
                }
                break;

            default:
                throw Errors.badRequest('Invalid purpose. Must be: instructor_subscription, course_purchase, or certificate_purchase');
        }

        // Create checkout
        const result = await subscriptionService.createCheckout({
            userId: user.id,
            plan: plan || 'monthly',
            customerEmail: user.email,
            customerName: user.fullName,
            redirectUrl,
            customData,
            variantId,
        });

        return {
            message: 'Checkout created successfully',
            checkoutUrl: result.checkoutUrl,
            checkoutId: result.checkoutId,
            purpose,
        };
    }

    /**
     * Get instructor status
     */
    async getStatus(request: FastifyRequest, reply: FastifyReply) {
        const user = request.user;

        if (!user) {
            throw Errors.unauthorized('Not authenticated');
        }

        const status = await subscriptionService.getInstructorStatus(user.id);

        return {
            message: 'Status retrieved successfully',
            ...status,
        };
    }

    /**
     * Cancel subscription
     */
    async cancelSubscription(request: FastifyRequest, reply: FastifyReply) {
        const user = request.user;

        if (!user) {
            throw Errors.unauthorized('Not authenticated');
        }

        await subscriptionService.cancelSubscription(user.id);

        return {
            message: 'Subscription cancelled successfully',
        };
    }
}

export const subscriptionController = new SubscriptionController();