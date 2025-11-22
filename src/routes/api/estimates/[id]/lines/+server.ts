// API Route: Estimate Lines
// Returns all lines for a specific estimate with rate information

import type { RequestHandler } from './$types';
import Database from 'better-sqlite3';
import { join } from 'path';

// Initialize database connection
const db = new Database(join(process.cwd(), 'db.sqlite'));

/**
 * GET /api/estimates/[id]/lines
 * Returns all lines for a specific estimate with joined rate information
 */
export const GET: RequestHandler = async ({ params }) => {
  try {
    const { id } = params;

    // Query estimate_db with JOIN to rates table
    const stmt = db.prepare(`
      SELECT
        ed.id_line,
        ed.id_estimate,
        ed.id_rate,
        ed.description,
        ed.qty,
        ed.blocked,
        r.service,
        r.rate
      FROM estimate_db ed
      LEFT JOIN rates r ON ed.id_rate = r.id_rate
      WHERE ed.id_estimate = ?
      ORDER BY ed.id_rate ASC
    `);

    const data = stmt.all(id) as any[];

    // Return data as JSON
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error) {
    console.error('Estimate lines API error:', error);
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

/**
 * PUT /api/estimates/[id]/lines
 * Saves/updates all lines for an estimate (replace mode)
 */
export const PUT: RequestHandler = async ({ params, request }) => {
  try {
    const { id } = params;
    const body = await request.json();
    const { lines } = body;

    if (!Array.isArray(lines)) {
      return new Response(
        JSON.stringify({ error: 'Lines must be an array' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if estimate is booked
    const checkStmt = db.prepare('SELECT booked FROM estimate WHERE id_estimate = ?');
    const estimate = checkStmt.get(id) as any;

    if (!estimate) {
      return new Response(
        JSON.stringify({ error: 'Estimate not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (estimate.booked === 1) {
      return new Response(
        JSON.stringify({ error: 'Booked estimates cannot be modified' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Delete all existing lines for this estimate (replace mode)
    const deleteStmt = db.prepare('DELETE FROM estimate_db WHERE id_estimate = ?');
    deleteStmt.run(id);

    // Insert new lines
    const insertStmt = db.prepare(`
      INSERT INTO estimate_db (id_estimate, id_rate, description, qty, blocked)
      VALUES (?, ?, ?, ?, 0)
    `);

    for (const line of lines) {
      // Only insert lines that have content
      if (line.id_rate || line.description || (line.qty && line.qty > 0)) {
        insertStmt.run(
          id,
          line.id_rate || null,
          line.description || '',
          line.qty || 0
        );
      }
    }

    // Return success
    return new Response(
      JSON.stringify({ ok: true }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Save estimate lines error:', error);
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
