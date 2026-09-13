// src/middleware/role.middleware.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { Errors } from '../utils/handle-request.js';
import { subscriptionService } from '../services/subscription.service.js';

/**
 *  Role-based access control middleware
 * 
 * Usage:
 * preHandler: [authenticate, requireRole('admin')]
 * preHandler: [authenticate, requireRole(['admin', 'instructor'])]
 */
export function requireRole(allowedRoles: string | string[]) {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    return async (request: FastifyRequest, reply: FastifyReply) => {
        // Get user from request (set by authenticate middleware)
        const user = request.user;

        if (!user) {
            throw Errors.unauthorized('Not authenticated');
        }

        // Check if user has required role
        if (!roles.includes(user.role)) {
            throw Errors.forbidden(`Access denied. Required role: ${roles.join(' or ')}`);
        }

        //User has required role, continue
        return;
    };
}

/**
 * Check if user is admin
 */
export function isAdmin(request: FastifyRequest, reply: FastifyReply) {
    const user = request.user;

    if (!user) {
        throw Errors.unauthorized('Not authenticated');
    }

    if (user.role !== 'admin') {
        throw Errors.forbidden('Admin access required');
    }
}

/**
 *  Check if user is instructor or admin
 */
export function isInstructorOrAdmin(request: FastifyRequest, reply: FastifyReply) {
    const user = request.user;

    if (!user) {
        throw Errors.unauthorized('Not authenticated');
    }

    if (!['admin', 'instructor'].includes(user.role)) {
        throw Errors.forbidden('Instructor or admin access required');
    }
}

/**
 *  Check if user owns the resource (or is admin)
 * 
 * Usage: preHandler: [authenticate, requireOwnership('userId')]
 */
export function requireOwnership(userIdField: string = 'userId') {
    return async (request: FastifyRequest, reply: FastifyReply) => {
        const user = request.user;

        if (!user) {
            throw Errors.unauthorized('Not authenticated');
        }

        //  Admin can access anything
        if (user.role === 'admin') {
            return;
        }

        // Get the resource owner ID from params or body
        const resourceOwnerId = (request.params as any)[userIdField] ||
            (request.body as any)[userIdField];

        if (!resourceOwnerId) {
            throw Errors.badRequest('Resource owner ID not found');
        }

        //  Check if user owns the resource
        if (user.id !== resourceOwnerId) {
            throw Errors.forbidden('You do not own this resource');
        }
    };
}

/**
 * Check if user is an active instructor (has subscription)
 */
export async function requireActiveInstructor(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const user = request.user;

    if (!user) {
        throw Errors.unauthorized('Not authenticated');
    }

    const isActive = await subscriptionService.isActiveInstructor(user.id);

    if (!isActive) {
        throw Errors.forbidden(
            'Active instructor subscription required to create courses'
        );
    }
}

/**
 * Check if user is instructor (even if subscription expired)
 * Can view dashboard but not create content
 */
export async function requireInstructor(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const user = request.user;

    if (!user) {
        throw Errors.unauthorized('Not authenticated');
    }

    if (user.role !== 'instructor' && user.role !== 'admin') {
        throw Errors.forbidden('Instructor access required');
    }
}