// src/webhooks/lemon-squeezy.webhook.ts
import { FastifyInstance } from 'fastify';
import { logger } from '../utils/logger.js';
import { handleInstructorSubscription } from './handlers/subscription.handler.js';
// import { handleCoursePurchase } from './handlers/course.handler.js';
// import { handleCertificatePurchase } from './handlers/certificate.handler.js';

export default async function lemonSqueezyWebhook(fastify: FastifyInstance) {
    fastify.post('/webhooks/lemon-squeezy', {
        config: {
            rawBody: true
        },
    }, async (request, reply) => {
        try {

            const payload = request.body as any;
            const eventName = payload.meta?.event_name;
            const data = payload.data;
            const customData = data?.attributes?.custom_data || {};

            logger.info({
                msg: 'Lemon Squeezy webhook received:',
                event: eventName,
                purpose: customData.purpose,
            });

            // Only process successful events
            const isSuccessful = ['paid', 'active', 'subscription_created', 'subscription_payment_success'].includes(
                data?.attributes?.status
            );

            if (!isSuccessful) {
                logger.info({ msg: 'Skipping non-successful event:', status: data?.attributes?.status });
                return reply.status(200).send({ success: true });
            }

            // Route to appropriate handler based on purpose
            switch (customData.purpose) {
                case 'instructor_subscription':
                    await handleInstructorSubscription(data);
                    break;

                case 'course_purchase':
                    //await handleCoursePurchase(data);
                    break;

                case 'certificate_purchase':
                    // await handleCertificatePurchase(data);
                    break;

                default:
                    logger.warn('Unknown purpose:', customData.purpose);
            }

            return reply.status(200).send({ success: true });
        } catch (error: any) {
            logger.error('Webhook error:', error);
            return reply.status(200).send({ success: false });
        }
    });
}