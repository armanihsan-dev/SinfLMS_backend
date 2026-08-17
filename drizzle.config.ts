// drizzle.config.ts
import type { Config } from 'drizzle-kit';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Drizzle Kit Configuration:
 * 
 * - schema: Where your table definitions are
 * - out: Where migrations will be generated
 * - dialect: PostgreSQL (we're using Neon)
 * - dbCredentials: Database connection details
 * - verbose: Show detailed logs
 * - strict: Strict mode for migrations
 */

export default {
    schema: './src/db/schema/*.schema.ts',
    out: './src/db/migrations',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
    verbose: true,
    strict: true,
} satisfies Config;