// API Route: Delete Check
// Returns count of records that would be deleted

import type { RequestHandler } from './$types';
import Database from 'better-sqlite3';
import { join } from 'path';

// Initialize database connection
const db = new Database(join(process.cwd(), 'db.sqlite'));

/**
 * GET /api/estimates/[id]/delete-check
 * Returns counts of what would be deleted
 */
export const GET: RequestHandler = async ({ params }) => {
  try {
    const { id } = params;

    // Check if estimate exists
    const headerStmt = db.prepare('SELECT COUNT(*) as count FROM estimate WHERE id_estimate = ?');
    const headerResult = headerStmt.get(id) as any;
    const headerCount = headerResult?.count ?? 0;

    if (headerCount === 0) {
      return new Response(
        JSON.stringify({ error: 'Estimate not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Count lines
    const linesStmt = db.prepare('SELECT COUNT(*) as count FROM estimate_db WHERE id_estimate = ?');
    const linesResult = linesStmt.get(id) as any;
    const linesCount = linesResult?.count ?? 0;

    // Return counts
    return new Response(
      JSON.stringify({
        ok: true,
        counts: {
          header: headerCount,
          lines: linesCount
        }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Delete check error:', error);
    return new Response(
      JSON.stringify({
        error: 'Database error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
