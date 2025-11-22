// API Route: Debtors
// Returns all debtors from SQLite database

import type { RequestHandler } from './$types';
import Database from 'better-sqlite3';
import { join } from 'path';

// Initialize database connection
const db = new Database(join(process.cwd(), 'db.sqlite'));

/**
 * GET /api/debtors
 * Returns all debtors from debtors table
 */
export const GET: RequestHandler = async ({ url }) => {
  try {
    // Check if filtering for active only (blocked = 0)
    const showAll = url.searchParams.get('all') === '1';

    // Query debtors table ordered by account
    const query = showAll
      ? 'SELECT * FROM debtors ORDER BY account'
      : 'SELECT * FROM debtors WHERE blocked = 0 ORDER BY account';

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
    console.error('Debtors API error:', error);
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
 * POST /api/debtors
 * Creates a new debtor
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

    // Validate account number range (10000-69999)
    const accountNum = Number(account);
    if (isNaN(accountNum) || accountNum < 10000 || accountNum > 69999) {
      return new Response(
        JSON.stringify({ error: 'Account number must be between 10000 and 69999' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if account already exists
    const checkStmt = db.prepare('SELECT account FROM debtors WHERE account = ?');
    const existing = checkStmt.get(accountNum);

    if (existing) {
      return new Response(
        JSON.stringify({ error: 'Account number already exists' }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Compute info field (salutation + name)
    const info = `${salutation || ''} ${name}`.trim();

    // Insert new debtor
    const insertStmt = db.prepare(
      `INSERT INTO debtors (account, salutation, name, adress1, adress2, adress3, email, info, blocked, OPBereich, OPArt, filterNo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 'OP', 'Debitor', 20)`
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
    console.error('Create debtor error:', error);
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
