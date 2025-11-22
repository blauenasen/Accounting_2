// API Route: Single Estimate Operations
// Handles update and delete operations for a specific estimate

import type { RequestHandler } from './$types';
import Database from 'better-sqlite3';
import { join } from 'path';

// Initialize database connection
const db = new Database(join(process.cwd(), 'db.sqlite'));

/**
 * PUT /api/estimates/[id]
 * Updates an existing estimate
 */
export const PUT: RequestHandler = async ({ params, request }) => {
  try {
    const { id } = params;
    const body = await request.json();
    const { date, account } = body;

    // Validate required fields
    if (!date || account == null) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: date, account' }),
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

    // Update estimate
    const updateStmt = db.prepare(
      'UPDATE estimate SET date = ?, account = ? WHERE id_estimate = ?'
    );
    const info = updateStmt.run(date, account, id);

    if (info.changes === 0) {
      return new Response(
        JSON.stringify({ error: 'Estimate not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
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
    console.error('Update estimate error:', error);
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
 * DELETE /api/estimates/[id]
 * Deletes an estimate and all its lines
 */
export const DELETE: RequestHandler = async ({ params }) => {
  try {
    const { id } = params;

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
        JSON.stringify({ error: 'Booked estimates cannot be deleted' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Start transaction (using run commands sequentially)
    // Count lines before deletion
    const countStmt = db.prepare('SELECT COUNT(*) as count FROM estimate_db WHERE id_estimate = ?');
    const countResult = countStmt.get(id) as any;
    const linesCount = countResult?.count ?? 0;

    // Delete lines first (foreign key constraint)
    const deleteLinesStmt = db.prepare('DELETE FROM estimate_db WHERE id_estimate = ?');
    deleteLinesStmt.run(id);

    // Delete estimate header
    const deleteHeaderStmt = db.prepare('DELETE FROM estimate WHERE id_estimate = ?');
    const info = deleteHeaderStmt.run(id);

    if (info.changes === 0) {
      return new Response(
        JSON.stringify({ error: 'Estimate not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Return success with deletion counts
    return new Response(
      JSON.stringify({
        ok: true,
        deleted: {
          header: 1,
          lines: linesCount
        }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Delete estimate error:', error);
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
