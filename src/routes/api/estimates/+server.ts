// API Route: Estimates
// Returns all estimates from SQLite database

import type { RequestHandler } from './$types';
import Database from 'better-sqlite3';
import { join } from 'path';

// Initialize database connection
const db = new Database(join(process.cwd(), 'db.sqlite'));

/**
 * GET /api/estimates
 * Returns all estimates from estimate table
 */
export const GET: RequestHandler = async () => {
  try {
    // Query estimate table ordered by year DESC, num ASC
    const stmt = db.prepare('SELECT * FROM estimate ORDER BY year DESC, num ASC');
    const data = stmt.all() as any[];

    // Return data as JSON
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error) {
    console.error('Estimates API error:', error);
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
 * POST /api/estimates
 * Creates a new estimate
 */
export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const { year, date, account } = body;

    // Validate required fields
    if (!year || !date || account == null) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: year, date, account' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get the next num for this year
    const maxNumStmt = db.prepare('SELECT MAX(num) as maxNum FROM estimate WHERE year = ?');
    const result = maxNumStmt.get(year) as any;
    const nextNum = (result?.maxNum ?? 0) + 1;

    // Insert new estimate
    const insertStmt = db.prepare(
      'INSERT INTO estimate (year, num, date, account, blocked) VALUES (?, ?, ?, ?, 0)'
    );
    const info = insertStmt.run(year, nextNum, date, account);

    // Return the new id_estimate
    return new Response(
      JSON.stringify({ id_estimate: info.lastInsertRowid }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Create estimate error:', error);
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
