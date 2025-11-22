// API Route: Single Debtor Operations
// Handles GET, UPDATE and DELETE operations for a specific debtor

import type { RequestHandler } from './$types';
import Database from 'better-sqlite3';
import { join } from 'path';

// Initialize database connection
const db = new Database(join(process.cwd(), 'db.sqlite'));

/**
 * GET /api/debtors/[id]
 * Returns a single debtor by account number
 */
export const GET: RequestHandler = async ({ params }) => {
  try {
    const { id } = params;

    // Query single debtor
    const stmt = db.prepare('SELECT * FROM debtors WHERE account = ?');
    const debtor = stmt.get(id) as any;

    if (!debtor) {
      return new Response(
        JSON.stringify({ error: 'Debtor not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Return debtor as JSON
    return new Response(JSON.stringify(debtor), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error) {
    console.error('Get debtor error:', error);
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
 * PUT /api/debtors/[id]
 * Updates an existing debtor
 */
export const PUT: RequestHandler = async ({ params, request }) => {
  try {
    const { id } = params;
    const body = await request.json();
    const { salutation, name, adress1, adress2, adress3, email, blocked } = body;

    // Validate required fields
    if (!name) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: name' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if debtor exists
    const checkStmt = db.prepare('SELECT account FROM debtors WHERE account = ?');
    const debtor = checkStmt.get(id) as any;

    if (!debtor) {
      return new Response(
        JSON.stringify({ error: 'Debtor not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Compute info field (salutation + name)
    const info = `${salutation || ''} ${name}`.trim();

    // Update debtor
    const updateStmt = db.prepare(
      `UPDATE debtors SET salutation = ?, name = ?, adress1 = ?, adress2 = ?, adress3 = ?, email = ?, info = ?, blocked = ?
       WHERE account = ?`
    );
    const blockedValue = blocked !== undefined ? Number(blocked) : 0;
    const result = updateStmt.run(
      salutation || null,
      name,
      adress1 || null,
      adress2 || null,
      adress3 || null,
      email || null,
      info,
      blockedValue,
      id
    );

    if (result.changes === 0) {
      return new Response(
        JSON.stringify({ error: 'Debtor not found' }),
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
    console.error('Update debtor error:', error);
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
 * DELETE /api/debtors/[id]
 * Soft-deletes a debtor (sets blocked = 1)
 */
export const DELETE: RequestHandler = async ({ params }) => {
  try {
    const { id } = params;

    // Check if debtor exists
    const checkStmt = db.prepare('SELECT account FROM debtors WHERE account = ?');
    const debtor = checkStmt.get(id) as any;

    if (!debtor) {
      return new Response(
        JSON.stringify({ error: 'Debtor not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Soft delete: set blocked = 1
    const updateStmt = db.prepare('UPDATE debtors SET blocked = 1 WHERE account = ?');
    const result = updateStmt.run(id);

    if (result.changes === 0) {
      return new Response(
        JSON.stringify({ error: 'Debtor not found' }),
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
    console.error('Delete debtor error:', error);
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
