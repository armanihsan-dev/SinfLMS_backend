// // src/webhooks/handlers/certificate.handler.ts
// import { certificateService } from '../../services/certificate.service.js';
// import { logger } from '../../utils/logger.js';

// export async function handleCertificatePurchase(eventData: any) {
//     const customData = eventData.attributes.custom_data || {};
//     const userId = customData.userId;

//     logger.info('Processing certificate purchase:', { userId });

//     await certificateService.generateCertificate(userId);

//     return { success: true };
// }