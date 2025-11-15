// src/lib/server/index.ts
// Central database access layer

import Database from 'better-sqlite3';
import { ensureSchema } from './schema.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Determine database path (supports .env configuration)
const DB_PATH = process.env.DB_PATH || 'db.sqlite';

// Create database instance
const db = new Database(DB_PATH, { fileMustExist: true });

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// Run schema migrations
ensureSchema(db);

// Export database instance
export { db };
export default db;

/**
 * Get database instance (legacy compatibility)
 */
export function getDb(): Database.Database {
  return db;
}

/**
 * Legacy export for compatibility
 */
export const connection = db;

// Module re-exports will be added in Phase 3 when modules are migrated
// TODO Phase 3: Import and re-export db modules (stammdaten, rates, debtors, creditors, etc.)
