// API Route: Creditors
// Returns all creditors from SQLite database

import type { RequestHandler } from './$types';
import Database from 'better-sqlite3';
import { join } from 'path';

// Initialize database connection
const db = new Database(join(process.cwd(), 'db.sqlite'));

/**
 * GET /api/creditors
 * Returns all creditors from creditors table
 */
export const GET: RequestHandler = async ({ url }) => {
  try {
    // Check if filtering for active only (blocked = 0)
    const showAll = url.searchParams.get('all') === '1';

    // Query creditors table ordered by account
    const query = showAll
      ? 'SELECT * FROM creditors ORDER BY account'
      : 'SELECT * FROM creditors WHERE blocked = 0 ORDER BY account';

    const stmt = db.prepare(query);
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
    console.error('Creditors API error:', error);
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
 * POST /api/creditors
 * Creates a new creditor
 */
export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const { account, salutation, name, adress1, adress2, adress3, email } = body;

    // Validate required fields
    if (!account || !name) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: account, name' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate account number range (70000-99999)
    const accountNum = Number(account);
    if (isNaN(accountNum) || accountNum < 70000 || accountNum > 99999) {
      return new Response(
        JSON.stringify({ error: 'Account number must be between 70000 and 99999' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if account already exists
    const checkStmt = db.prepare('SELECT account FROM creditors WHERE account = ?');
    const existing = checkStmt.get(accountNum);

    if (existing) {
      return new Response(
        JSON.stringify({ error: 'Account number already exists' }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Compute info field (salutation + name)
    const info = `${salutation || ''} ${name}`.trim();

    // Insert new creditor
    const insertStmt = db.prepare(
      `INSERT INTO creditors (account, salutation, name, adress1, adress2, adress3, email, info, blocked, OPBereich, OPArt, filterNo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 'OP', 'Creditor', 30)`
    );
    insertStmt.run(accountNum, salutation || null, name, adress1 || null, adress2 || null, adress3 || null, email || null, info);

    // Return the new account
    return new Response(
      JSON.stringify({ account: accountNum }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Create creditor error:', error);
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
