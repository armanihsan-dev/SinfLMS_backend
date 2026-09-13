// // src/webhooks/handlers/course.handler.ts
// import { enrollmentService } from '../../services/enrollment.service.js';
// import { logger } from '../../utils/logger.js';

// export async function handleCoursePurchase(eventData: any) {
//     const customData = eventData.attributes.custom_data || {};
//     const { userId, courseId } = customData;

//     logger.info('Processing course purchase:', { userId, courseId });

//     // Enroll student in course
//     await enrollmentService.enrollStudent(userId, courseId);

//     return { success: true };
// }