// migrate.ts
// Database migration script for Phase 2

import Database from 'better-sqlite3';
import { ensureSchema } from './src/lib/server/schema.js';

const DB_PATH = process.env.DB_PATH || 'db.sqlite';

console.log('🔄 Starting database migration...');
console.log(`📁 Database: ${DB_PATH}`);

try {
  // Open database
  const db = new Database(DB_PATH, { fileMustExist: true });

  // Enable WAL mode
  db.pragma('journal_mode = WAL');
  console.log('✅ WAL mode enabled');

  // Run schema migrations
  console.log('🔄 Running schema migrations...');
  ensureSchema(db);
  console.log('✅ Schema migrations completed');

  // Verify database integrity
  console.log('🔄 Checking database integrity...');
  const integrityCheck = db.prepare('PRAGMA integrity_check').get() as { integrity_check: string };
  if (integrityCheck.integrity_check === 'ok') {
    console.log('✅ Database integrity check passed');
  } else {
    console.error('❌ Database integrity check failed:', integrityCheck);
    process.exit(1);
  }

  // Test query
  console.log('🔄 Testing database connection...');
  const testRow = db.prepare('SELECT * FROM journal LIMIT 1').get();
  if (testRow) {
    console.log('✅ Database connection test passed');
    console.log('📋 Sample row columns:', Object.keys(testRow).join(', '));
  } else {
    console.log('⚠️  Journal table is empty (this is OK for new databases)');
  }

  // Show index status
  console.log('🔄 Checking indexes...');
  const indexes = db.prepare(`
    SELECT name FROM sqlite_master
    WHERE type='index' AND tbl_name='journal'
    ORDER BY name
  `).all() as Array<{ name: string }>;
  console.log('✅ Indexes created:', indexes.map(idx => idx.name).join(', '));

  // Close database
  db.close();

  console.log('');
  console.log('✅ Migration completed successfully!');
  console.log('');

} catch (error) {
  console.error('❌ Migration failed:', error);
  process.exit(1);
}
