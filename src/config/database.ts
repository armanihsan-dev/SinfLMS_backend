// src/config/database.ts
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http'; // ← Changed from neon-serverless
import * as schema from '../db/schema/index.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate DATABASE_URL
if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
}

// Create the Neon SQL connection
const sql = neon(process.env.DATABASE_URL);

// Create the Drizzle instance with our schema
export const db = drizzle(sql, {
    schema,
    logger: process.env.NODE_ENV === 'development', // ← Changed env to process.env
});