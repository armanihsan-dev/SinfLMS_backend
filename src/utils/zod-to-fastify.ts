// src/utils/zod-to-fastify.ts
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

// 🎯 Main function to convert Zod to Fastify Schema
export function createFastifySchema<T extends z.ZodTypeAny>(options: {
    body?: T;
    params?: T;
    querystring?: T;
    response?: Record<number, z.ZodTypeAny>;
}) {
    const schema: any = {};

    if (options.body) {
        schema.body = zodToJsonSchema(options.body);
    }

    if (options.params) {
        schema.params = zodToJsonSchema(options.params);
    }

    if (options.querystring) {
        schema.querystring = zodToJsonSchema(options.querystring);
    }

    if (options.response) {
        schema.response = {};
        for (const [status, zodSchema] of Object.entries(options.response)) {
            schema.response[status] = zodToJsonSchema(zodSchema);
        }
    }

    return schema;
}

// 🎯 Helper for common route schemas
export function createRouteSchema<TBody extends z.ZodTypeAny>(config: {
    body: TBody;
    response: Record<number, z.ZodTypeAny>;
    tags?: string[];
    description?: string;
}) {
    return {
        tags: config.tags || [],
        description: config.description || '',
        ...createFastifySchema({
            body: config.body,
            response: config.response,
        }),
    };
}